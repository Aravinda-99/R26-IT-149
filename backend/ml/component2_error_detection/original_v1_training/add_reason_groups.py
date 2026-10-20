import pandas as pd

def get_reason_group(reason_label):
    group_map = {
        # LOOP_ERROR
        'LOOP_OFF_BY_ONE': 'LOOP_BOUNDARY_ISSUE',
        'LOOP_WRONG_CONDITION': 'LOOP_CONDITION_ISSUE',
        'LOOP_MISSING_UPDATE': 'LOOP_UPDATE_ISSUE',
        'LOOP_CONTINUE_SKIP_UPDATE': 'LOOP_CONTROL_FLOW_ISSUE',
        'LOOP_WRONG_COUNTER_DIRECTION': 'LOOP_UPDATE_ISSUE',

        # VARIABLE_ERROR
        'VARIABLE_WRONG_CALCULATION': 'VARIABLE_CALCULATION_ISSUE',
        'VARIABLE_INTEGER_DIVISION': 'VARIABLE_CALCULATION_ISSUE',
        'VARIABLE_WRONG_INITIALIZATION': 'VARIABLE_ASSIGNMENT_ISSUE',
        'VARIABLE_OVERWRITTEN_VALUE': 'VARIABLE_ASSIGNMENT_ISSUE',
        'VARIABLE_WRONG_ASSIGNMENT': 'VARIABLE_ASSIGNMENT_ISSUE',

        # ARRAY_ERROR
        'ARRAY_OUT_OF_BOUNDS': 'ARRAY_BOUNDARY_INDEX_ISSUE',
        'ARRAY_LENGTH_AS_INDEX': 'ARRAY_BOUNDARY_INDEX_ISSUE',
        'ARRAY_WRONG_TRAVERSAL': 'ARRAY_TRAVERSAL_ISSUE',
        'ARRAY_SKIPPED_ELEMENT': 'ARRAY_TRAVERSAL_ISSUE',
        'ARRAY_WRONG_INDEX_VARIABLE': 'ARRAY_BOUNDARY_INDEX_ISSUE',

        # METHOD_ERROR
        'METHOD_ARGUMENT_MISMATCH': 'METHOD_SIGNATURE_ISSUE',
        'METHOD_PARAMETER_ORDER_ERROR': 'METHOD_SIGNATURE_ISSUE',
        'METHOD_MISSING_RETURN': 'METHOD_RETURN_ISSUE',
        'METHOD_WRONG_RETURN_OPERATION': 'METHOD_RETURN_ISSUE',
        'METHOD_IGNORED_PARAMETER': 'METHOD_PARAMETER_USAGE_ISSUE',
        'METHOD_WRONG_CALL': 'METHOD_SIGNATURE_ISSUE',

        # CORRECT
        'CORRECT_NO_ERROR': 'CORRECT_NO_ERROR'
    }
    return group_map.get(reason_label, 'UNKNOWN')

def main():
    input_path = 'D:/Work/Research_ML_Dataset/processed/final_dataset_with_reason_labels.csv'
    output_path = 'D:/Work/Research_ML_Dataset/processed/final_dataset_with_reason_groups.csv'
    summary_path = 'D:/Work/Research_ML_Dataset/processed/reason_group_summary.csv'

    print(f"Loading {input_path}...")
    df = pd.read_csv(input_path)
    original_len = len(df)
    
    print("Mapping reason groups...")
    df['reason_group'] = df['reason_label'].apply(get_reason_group)
    
    # Validation 1: Same number of rows
    assert len(df) == original_len, f"Row count mismatch! Expected {original_len}, got {len(df)}"
    print(f"Validation 1 Passed: Dataset has {len(df)} rows.")
    
    # Validation 2 & 3: No missing or UNKNOWN values
    missing_count = df['reason_group'].isnull().sum()
    assert missing_count == 0, f"Found {missing_count} missing reason_groups"
    unknown_count = (df['reason_group'] == 'UNKNOWN').sum()
    assert unknown_count == 0, f"Found {unknown_count} UNKNOWN reason_groups"
    print("Validation 2 & 3 Passed: No missing or UNKNOWN reason_group values.")
    
    # Save the new dataset
    cols = list(df.columns)
    if 'reason_group' in cols:
        cols.remove('reason_group')
        idx = cols.index('reason_label') + 1
        cols.insert(idx, 'reason_group')
        df = df[cols]
        
    df.to_csv(output_path, index=False)
    print(f"\nSaved dataset with reason groups to: {output_path}")
    
    # Validation 4: Print count by broad label
    print("\nValidation 4: Count by broad label")
    print(df['label'].value_counts())

    # Validation 5: Print count by original reason_label
    print("\nValidation 5: Count by original reason_label")
    print(df['reason_label'].value_counts())
    
    # Validation 6: Print count by new reason_group
    print("\nValidation 6: Count by new reason_group")
    group_counts = df['reason_group'].value_counts()
    print(group_counts)
    
    # Validation 7: Create processed/reason_group_summary.csv
    group_counts.to_csv(summary_path, header=['count'])
    print(f"\nValidation 7 Passed: Created {summary_path}")
    
    # Validation 8: Show 5 sample rows from each broad label
    print("\nValidation 8: Sample rows per broad label")
    for label in df['label'].unique():
        print(f"\n--- Samples for {label} ---")
        sample_df = df[df['label'] == label].head(5)
        for _, row in sample_df.iterrows():
            print(f"File: {row['filename']}")
            print(f"Label: {row['label']}")
            print(f"Error Description: {row['error_description']}")
            print(f"Reason Label: {row['reason_label']}")
            print(f"Reason Group: {row['reason_group']}")
            print("-" * 40)

if __name__ == "__main__":
    main()
