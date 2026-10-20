import os
import pandas as pd

def validate():
    csv_path = 'labels.csv'
    codes_dir = 'codes'
    
    if not os.path.exists(csv_path):
        print("Error: labels.csv missing")
        return
        
    df = pd.read_csv(csv_path)
    valid = True
    
    # 1. Exactly 2000 files
    if len(df) != 2000:
        print(f"Error: Expected 2000 files in CSV, found {len(df)}")
        valid = False
        
    # 2. Exactly 400 per label
    label_counts = df['label'].value_counts()
    for label in ['LOOP_ERROR', 'VARIABLE_ERROR', 'ARRAY_ERROR', 'METHOD_ERROR', 'CORRECT']:
        if label_counts.get(label, 0) != 400:
            print(f"Error: Expected 400 {label}, found {label_counts.get(label, 0)}")
            valid = False
            
    # 3. Allowed error_types only
    valid_types = {'LOGIC', 'CONCEPTUAL', 'RUNTIME', 'SYNTAX', 'NONE'}
    invalid_types = set(df['error_type']) - valid_types
    if invalid_types:
        print(f"Error: Found invalid error_types: {invalid_types}")
        valid = False
        
    # 4. Check if all files exist and no duplicates
    if df['filename'].duplicated().any():
        print("Error: Duplicate filenames found in CSV")
        valid = False
        
    missing_files = []
    for filename in df['filename']:
        if not os.path.exists(os.path.join(codes_dir, filename)):
            missing_files.append(filename)
            
    if missing_files:
        print(f"Error: {len(missing_files)} files listed in CSV are missing from disk")
        valid = False
        
    disk_files = [f for f in os.listdir(codes_dir) if f.endswith('.java')]
    if len(disk_files) != 2000:
        print(f"Error: Expected exactly 2000 .java files on disk, found {len(disk_files)}")
        valid = False
        
    if valid:
        print("Validation Passed! The dataset perfectly matches all constraints.")
        print("\nDetailed Error Type Distribution:")
        print(df['error_type'].value_counts())

if __name__ == "__main__":
    validate()
