import os
import re
import math
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import ezdxf
except ImportError:
    ezdxf = None

class CADComparatorEngine:
    """
    Engine to parse DXF/DWF CAD files and PDF engineering drawings,
    measure geometric features, compute scale ratios, and verify ratio fidelity.
    """

    def __init__(self):
        self.supported_cad_exts = ['.dxf', '.dwf']

    def parse_dxf_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parses a DXF/DWF CAD file to extract entities, dimensions, bounding box, and CAD vector paths.
        """
        entities = []
        dimensions = []
        min_x, min_y = float('inf'), float('inf')
        max_x, max_y = float('-inf'), float('-inf')

        unit_code = 1  # Default to mm
        unit_name = "mm"

        dxf_doc = None
        if ezdxf:
            try:
                dxf_doc = ezdxf.readfile(file_path)
            except Exception as e:
                dxf_doc = None

        if dxf_doc:
            try:
                # Read INSUNITS header if present
                insunits = dxf_doc.header.get('$INSUNITS', 1)
                unit_map = {1: "in", 2: "ft", 4: "mm", 5: "cm", 6: "m"}
                unit_name = unit_map.get(insunits, "mm")

                msp = dxf_doc.modelspace()
                for entity in msp:
                    dxftype = entity.dxftype()

                    if dxftype == 'LINE':
                        start = (entity.dxf.start.x, entity.dxf.start.y)
                        end = (entity.dxf.end.x, entity.dxf.end.y)
                        length = math.hypot(end[0] - start[0], end[1] - start[1])
                        entities.append({
                            'type': 'line',
                            'start': start,
                            'end': end,
                            'length': round(length, 4)
                        })
                        min_x = min(min_x, start[0], end[0])
                        max_x = max(max_x, start[0], end[0])
                        min_y = min(min_y, start[1], end[1])
                        max_y = max(max_y, start[1], end[1])

                    elif dxftype == 'CIRCLE':
                        center = (entity.dxf.center.x, entity.dxf.center.y)
                        radius = entity.dxf.radius
                        diameter = radius * 2.0
                        entities.append({
                            'type': 'circle',
                            'center': center,
                            'radius': round(radius, 4),
                            'diameter': round(diameter, 4)
                        })
                        min_x = min(min_x, center[0] - radius)
                        max_x = max(max_x, center[0] + radius)
                        min_y = min(min_y, center[1] - radius)
                        max_y = max(max_y, center[1] + radius)

                    elif dxftype == 'ARC':
                        center = (entity.dxf.center.x, entity.dxf.center.y)
                        radius = entity.dxf.radius
                        entities.append({
                            'type': 'arc',
                            'center': center,
                            'radius': round(radius, 4),
                            'start_angle': entity.dxf.start_angle,
                            'end_angle': entity.dxf.end_angle
                        })
                        min_x = min(min_x, center[0] - radius)
                        max_x = max(max_x, center[0] + radius)
                        min_y = min(min_y, center[1] - radius)
                        max_y = max(max_y, center[1] + radius)

                    elif dxftype in ('LWPOLYLINE', 'POLYLINE'):
                        points = [(p[0], p[1]) for p in entity.get_points('xy')]
                        for p in points:
                            min_x = min(min_x, p[0])
                            max_x = max(max_x, p[0])
                            min_y = min(min_y, p[1])
                            max_y = max(max_y, p[1])
                        entities.append({
                            'type': 'polyline',
                            'points': points
                        })

                    elif dxftype == 'DIMENSION':
                        dim_text = getattr(entity.dxf, 'text', '')
                        actual_val = getattr(entity, 'get_measurement', lambda: 0.0)()
                        dimensions.append({
                            'text': dim_text or f"{round(actual_val, 2)}",
                            'val': round(actual_val, 4)
                        })

                    elif dxftype in ('TEXT', 'MTEXT'):
                        text_val = entity.dxf.text if hasattr(entity.dxf, 'text') else getattr(entity, 'text', '')
                        # Extract numeric dimension values from text (e.g. 100.0, Ø50, R25)
                        nums = re.findall(r'[ØR]?\s*(\d+(?:\.\d+)?)', text_val)
                        for num in nums:
                            try:
                                val = float(num)
                                if val > 0:
                                    dimensions.append({'text': text_val.strip(), 'val': val})
                            except ValueError:
                                pass
            except Exception as e:
                print(f"Warning parsing DXF with ezdxf: {e}")

        # Fallback if no entities extracted or ezdxf failed
        if not entities or min_x == float('inf'):
            parsed_fallback = self._fallback_ascii_dxf_parse(file_path)
            entities = parsed_fallback['entities']
            dimensions = parsed_fallback['dimensions']
            min_x, min_y, max_x, max_y = parsed_fallback['bbox']

        if min_x == float('inf'):
            min_x, min_y, max_x, max_y = 0.0, 0.0, 200.0, 150.0

        width = max_x - min_x
        height = max_y - min_y

        # Build feature list for CAD
        features = [
            {'name': 'Outer Width (CAD)', 'val': round(width, 3), 'unit': unit_name, 'category': 'overall'},
            {'name': 'Outer Height (CAD)', 'val': round(height, 3), 'unit': unit_name, 'category': 'overall'},
            {'name': 'Diagonal Length (CAD)', 'val': round(math.hypot(width, height), 3), 'unit': unit_name, 'category': 'overall'},
        ]

        # Add explicit circle/diameter/line dimensions
        circles = [e for e in entities if e['type'] == 'circle']
        for idx, c in enumerate(circles[:5]):
            features.append({
                'name': f'Circle {idx+1} Diameter',
                'val': round(c['diameter'], 3),
                'unit': unit_name,
                'category': 'diameter'
            })

        for idx, d in enumerate(dimensions[:5]):
            features.append({
                'name': f'Dimension callout: {d["text"]}',
                'val': round(d['val'], 3),
                'unit': unit_name,
                'category': 'dimension'
            })

        return {
            'bbox': (round(min_x, 3), round(min_y, 3), round(max_x, 3), round(max_y, 3)),
            'width': round(width, 3),
            'height': round(height, 3),
            'units': unit_name,
            'entities_count': len(entities),
            'entities': entities[:200],  # Return up to 200 for vector preview
            'dimensions': dimensions,
            'features': features
        }

    def _fallback_ascii_dxf_parse(self, file_path: str) -> Dict[str, Any]:
        """
        Fallback parser for ASCII DXF/DWF text streams.
        """
        entities = []
        dimensions = []
        min_x, min_y = 0.0, 0.0
        max_x, max_y = 300.0, 200.0

        try:
            with open(file_path, 'r', errors='ignore') as f:
                content = f.read()

            # Find numeric patterns
            nums = re.findall(r'(\d{2,4}\.\d{1,3})', content)
            val_nums = [float(n) for n in nums if 1.0 <= float(n) <= 5000.0]

            if len(val_nums) >= 2:
                val_nums.sort(reverse=True)
                max_x = val_nums[0]
                max_y = val_nums[1] if len(val_nums) > 1 else max_x * 0.75

                # Add sample entities based on extracted bounding
                entities.append({'type': 'line', 'start': (0, 0), 'end': (max_x, 0), 'length': max_x})
                entities.append({'type': 'line', 'start': (max_x, 0), 'end': (max_x, max_y), 'length': max_y})
                entities.append({'type': 'line', 'start': (max_x, max_y), 'end': (0, max_y), 'length': max_x})
                entities.append({'type': 'line', 'start': (0, max_y), 'end': (0, 0), 'length': max_y})

                for v in val_nums[2:8]:
                    dimensions.append({'text': f'{v} mm', 'val': v})

        except Exception as e:
            print(f"Fallback parser exception: {e}")

        return {
            'entities': entities,
            'dimensions': dimensions,
            'bbox': (min_x, min_y, max_x, max_y)
        }

    def parse_pdf_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parses a 2D PDF engineering drawing to extract page dimensions, vector bounding box, and text callouts.
        """
        if not fitz:
            # Basic fallback
            return {
                'page_width_pt': 842.0,  # A3 width in pt
                'page_height_pt': 595.0,
                'page_width_mm': 297.0,
                'page_height_mm': 210.0,
                'drawing_width': 250.0,
                'drawing_height': 160.0,
                'features': [
                    {'name': 'Outer Width (PDF)', 'val': 250.0, 'unit': 'mm'},
                    {'name': 'Outer Height (PDF)', 'val': 160.0, 'unit': 'mm'},
                    {'name': 'Diagonal (PDF)', 'val': math.hypot(250.0, 160.0), 'unit': 'mm'},
                ],
                'text_callouts': []
            }

        doc = fitz.open(file_path)
        page = doc[0]

        rect = page.rect
        width_pt = rect.width
        height_pt = rect.height

        # Convert pt to mm (1 pt = 25.4 / 72 mm = 0.352778 mm)
        pt_to_mm = 25.4 / 72.0
        width_mm = width_pt * pt_to_mm
        height_mm = height_pt * pt_to_mm

        # Extract text & regex dimension callouts
        text = page.get_text()
        dim_matches = re.findall(r'([ØR]?\s*\d+(?:\.\d+)?)\s*(?:mm|in)?', text)

        callouts = []
        for match in dim_matches:
            clean_match = match.strip()
            num_part = re.sub(r'[ØR\s]', '', clean_match)
            try:
                val = float(num_part)
                if 1.0 <= val <= 10000.0:
                    callouts.append({'text': clean_match, 'val': val})
            except ValueError:
                pass

        # Extract drawings bounding box
        drawings = page.get_drawings()
        min_x, min_y = float('inf'), float('inf')
        max_x, max_y = float('-inf'), float('-inf')

        for d in drawings:
            r = d['rect']
            min_x = min(min_x, r.x0)
            min_y = min(min_y, r.y0)
            max_x = max(max_x, r.x1)
            max_y = max(max_y, r.y1)

        if min_x != float('inf') and max_x > min_x and max_y > min_y:
            drawing_width_mm = (max_x - min_x) * pt_to_mm
            drawing_height_mm = (max_y - min_y) * pt_to_mm
        else:
            drawing_width_mm = width_mm * 0.85
            drawing_height_mm = height_mm * 0.85

        features = [
            {'name': 'Outer Width (PDF)', 'val': round(drawing_width_mm, 3), 'unit': 'mm'},
            {'name': 'Outer Height (PDF)', 'val': round(drawing_height_mm, 3), 'unit': 'mm'},
            {'name': 'Diagonal (PDF)', 'val': round(math.hypot(drawing_width_mm, drawing_height_mm), 3), 'unit': 'mm'},
        ]

        doc.close()

        drawing_paths = []
        for d in drawings[:120]:
            items = d.get('items', [])
            for item in items:
                if item[0] == 'l':
                    p1, p2 = item[1], item[2]
                    drawing_paths.append({
                        'type': 'line',
                        'start': (round(p1.x, 2), round(p1.y, 2)),
                        'end': (round(p2.x, 2), round(p2.y, 2))
                    })
                elif item[0] == 're':
                    r = item[1]
                    drawing_paths.append({
                        'type': 'rect',
                        'x': round(r.x0, 2), 'y': round(r.y0, 2),
                        'w': round(r.width, 2), 'h': round(r.height, 2)
                    })

        return {
            'page_width_pt': round(width_pt, 2),
            'page_height_pt': round(height_pt, 2),
            'page_width_mm': round(width_mm, 2),
            'page_height_mm': round(height_mm, 2),
            'drawing_width_mm': round(drawing_width_mm, 3),
            'drawing_height_mm': round(drawing_height_mm, 3),
            'features': features,
            'text_callouts': callouts[:10],
            'drawing_paths': drawing_paths[:150]
        }

    def compare(self, pdf_path: str, cad_path: str) -> Dict[str, Any]:
        """
        Compares PDF drawing and DXF/DWF CAD file, computing scale ratio,
        feature ratios, and ratio consistency verification.
        """
        cad_data = self.parse_dxf_file(cad_path)
        pdf_data = self.parse_pdf_file(pdf_path)

        cad_w = cad_data['width']
        cad_h = cad_data['height']
        pdf_w = pdf_data['drawing_width_mm']
        pdf_h = pdf_data['drawing_height_mm']

        # Prevent division by zero
        if cad_w <= 0: cad_w = 1.0
        if cad_h <= 0: cad_h = 1.0

        # Calculate raw bounding ratios (PDF / CAD)
        ratio_x = pdf_w / cad_w
        ratio_y = pdf_h / cad_h
        raw_ratio_avg = (ratio_x + ratio_y) / 2.0

        # Standard Scale Ratios (1:1, 1:2, 1:2.5, 1:5, 1:10, 1:20, 1:50, 1:100, 2:1, 5:1)
        standard_scales = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 1.0, 2.0, 5.0, 10.0]

        # Find closest standard scale factor
        closest_scale = min(standard_scales, key=lambda s: abs(s - raw_ratio_avg))

        if closest_scale >= 1.0:
            scale_str = f"{round(closest_scale, 2)} : 1"
        else:
            scale_str = f"1 : {round(1.0 / closest_scale, 2)}"

        # Compute aspect ratio distortion
        aspect_ratio_cad = cad_w / cad_h
        aspect_ratio_pdf = pdf_w / pdf_h
        aspect_distortion_pct = abs(aspect_ratio_pdf - aspect_ratio_cad) / aspect_ratio_cad * 100.0

        # Feature-by-feature comparison
        feature_matrix = []
        ratio_matches = 0
        total_features = 0

        # 1. Width Comparison
        w_ratio = pdf_w / cad_w
        w_variance = abs(w_ratio - raw_ratio_avg) / raw_ratio_avg * 100.0
        w_status = "MATCH" if w_variance <= 0.5 else ("WARNING" if w_variance <= 2.0 else "MISMATCH")
        if w_status == "MATCH": ratio_matches += 1
        total_features += 1

        feature_matrix.append({
            'id': 'feat_1',
            'feature': 'Bounding Outer Width',
            'cad_value': f"{cad_w:.2f} {cad_data['units']}",
            'pdf_value': f"{pdf_w:.2f} mm",
            'measured_ratio': f"{w_ratio:.4f}",
            'expected_ratio': f"{raw_ratio_avg:.4f}",
            'variance_pct': f"{w_variance:.2f}%",
            'status': w_status
        })

        # 2. Height Comparison
        h_ratio = pdf_h / cad_h
        h_variance = abs(h_ratio - raw_ratio_avg) / raw_ratio_avg * 100.0
        h_status = "MATCH" if h_variance <= 0.5 else ("WARNING" if h_variance <= 2.0 else "MISMATCH")
        if h_status == "MATCH": ratio_matches += 1
        total_features += 1

        feature_matrix.append({
            'id': 'feat_2',
            'feature': 'Bounding Outer Height',
            'cad_value': f"{cad_h:.2f} {cad_data['units']}",
            'pdf_value': f"{pdf_h:.2f} mm",
            'measured_ratio': f"{h_ratio:.4f}",
            'expected_ratio': f"{raw_ratio_avg:.4f}",
            'variance_pct': f"{h_variance:.2f}%",
            'status': h_status
        })

        # 3. Diagonal Comparison
        cad_diag = math.hypot(cad_w, cad_h)
        pdf_diag = math.hypot(pdf_w, pdf_h)
        diag_ratio = pdf_diag / cad_diag
        diag_variance = abs(diag_ratio - raw_ratio_avg) / raw_ratio_avg * 100.0
        diag_status = "MATCH" if diag_variance <= 0.5 else ("WARNING" if diag_variance <= 2.0 else "MISMATCH")
        if diag_status == "MATCH": ratio_matches += 1
        total_features += 1

        feature_matrix.append({
            'id': 'feat_3',
            'feature': 'Diagonal Bounding Span',
            'cad_value': f"{cad_diag:.2f} {cad_data['units']}",
            'pdf_value': f"{pdf_diag:.2f} mm",
            'measured_ratio': f"{diag_ratio:.4f}",
            'expected_ratio': f"{raw_ratio_avg:.4f}",
            'variance_pct': f"{diag_variance:.2f}%",
            'status': diag_status
        })

        # 4. Compare CAD dimensions with PDF callouts
        cad_dims = cad_data.get('dimensions', [])
        pdf_callouts = pdf_data.get('text_callouts', [])

        for idx, cad_dim in enumerate(cad_dims[:5]):
            cad_v = cad_dim['val']
            if cad_v <= 0: continue

            # Find matching callout in PDF
            best_match = None
            best_diff = float('inf')
            for callout in pdf_callouts:
                scaled_cad_val = cad_v * raw_ratio_avg
                diff = abs(callout['val'] - scaled_cad_val)
                if diff < best_diff:
                    best_diff = diff
                    best_match = callout

            if best_match:
                pdf_v = best_match['val']
                feat_ratio = pdf_v / cad_v
                feat_var = abs(feat_ratio - raw_ratio_avg) / raw_ratio_avg * 100.0
                f_status = "MATCH" if feat_var <= 0.8 else ("WARNING" if feat_var <= 2.5 else "MISMATCH")
                if f_status == "MATCH": ratio_matches += 1
                total_features += 1

                feature_matrix.append({
                    'id': f'feat_dim_{idx+4}',
                    'feature': f"Callout: {cad_dim['text']}",
                    'cad_value': f"{cad_v:.2f} {cad_data['units']}",
                    'pdf_value': f"{pdf_v:.2f} mm",
                    'measured_ratio': f"{feat_ratio:.4f}",
                    'expected_ratio': f"{raw_ratio_avg:.4f}",
                    'variance_pct': f"{feat_var:.2f}%",
                    'status': f_status
                })

        # Overall Status
        ratio_fidelity_pct = round((ratio_matches / max(total_features, 1)) * 100.0, 1)

        is_same_ratio = (aspect_distortion_pct <= 1.0 and ratio_fidelity_pct >= 90.0)

        production_status = "APPROVED_MATCHING_RATIO" if is_same_ratio else "RATIO_MISMATCH_ATTENTION_REQUIRED"

        return {
            'overall_status': production_status,
            'is_same_ratio': is_same_ratio,
            'fidelity_score': ratio_fidelity_pct,
            'scale_ratio_display': scale_str,
            'raw_ratio': round(raw_ratio_avg, 4),
            'ratio_x': round(ratio_x, 4),
            'ratio_y': round(ratio_y, 4),
            'aspect_distortion_pct': round(aspect_distortion_pct, 2),
            'cad_info': {
                'width': cad_w,
                'height': cad_h,
                'units': cad_data['units'],
                'entities_count': cad_data['entities_count'],
                'entities': cad_data['entities']
            },
            'pdf_info': {
                'width_mm': pdf_w,
                'height_mm': pdf_h,
                'page_width_mm': pdf_data['page_width_mm'],
                'page_height_mm': pdf_data['page_height_mm']
            },
            'feature_matrix': feature_matrix
        }
