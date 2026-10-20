import pandas as pd

def map_reason(row):
    label = row['label']
    desc = str(row['error_description']).lower()
    
    if label == 'LOOP_ERROR':
        if any(kw in desc for kw in ['off-by-one', '<=', 'extra iteration', 'off by one', 'start index', 'starts at 1', 'boundary']): return 'LOOP_OFF_BY_ONE'
        if any(kw in desc for kw in ['missing update', 'missing increment', 'counter not updated', 'modifying', 'increments by 2']): return 'LOOP_MISSING_UPDATE'
        if any(kw in desc for kw in ['continue skip']): return 'LOOP_CONTINUE_SKIP_UPDATE'
        if any(kw in desc for kw in ['direction', 'decrements instead of increments']): return 'LOOP_WRONG_COUNTER_DIRECTION'
        if any(kw in desc for kw in ['condition', 'termination', 'unreachable', 'semicolon after for', 'nested loop', 'limit', 'scope', 'parenthesis']): return 'LOOP_WRONG_CONDITION'
        return 'LOOP_WRONG_CONDITION'
        
    elif label == 'VARIABLE_ERROR':
        if any(kw in desc for kw in ['integer division', 'truncation']): return 'VARIABLE_INTEGER_DIVISION'
        if any(kw in desc for kw in ['wrong calculation', 'discount added instead of subtracted', 'wrong formula', 'wrong arithmetic', 'subtraction', 'precision', 'concat', 'math']): return 'VARIABLE_WRONG_CALCULATION'
        if any(kw in desc for kw in ['overwrite', '= instead of +=']): return 'VARIABLE_OVERWRITTEN_VALUE'
        if any(kw in desc for kw in ['initialization', 'uninitialized', 'initialized to 1', 'initialization with 0']): return 'VARIABLE_WRONG_INITIALIZATION'
        if any(kw in desc for kw in ['assignment', 'assign', 'wrapper class', 'post-increment', 'reversed', 'type mismatch', 'shadowing', 'missing space']): return 'VARIABLE_WRONG_ASSIGNMENT'
        return 'VARIABLE_WRONG_CALCULATION'
        
    elif label == 'ARRAY_ERROR':
        if any(kw in desc for kw in ['length as index']): return 'ARRAY_LENGTH_AS_INDEX'
        if any(kw in desc for kw in ['out of bounds', 'invalid index', 'index beyond length', 'negative array index', 'negative array size', 'i+1 access']): return 'ARRAY_OUT_OF_BOUNDS'
        if any(kw in desc for kw in ['traversal', 'loop over array incorrectly', 'comparing', 'default values', 'reference copy', 'printing', 'non-array', 'method call', 'constant initialization', 'declaration']): return 'ARRAY_WRONG_TRAVERSAL'
        if any(kw in desc for kw in ['skip', 'last element', 'first element', 'starts at index 1']): return 'ARRAY_SKIPPED_ELEMENT'
        if any(kw in desc for kw in ['index variable', 'previous element', 'first element instead of current', 'swap']): return 'ARRAY_WRONG_INDEX_VARIABLE'
        return 'ARRAY_OUT_OF_BOUNDS'
        
    elif label == 'METHOD_ERROR':
        if any(kw in desc for kw in ['argument', 'parameter count', 'method signature', 'overloading', 'missing parentheses']): return 'METHOD_ARGUMENT_MISMATCH'
        if any(kw in desc for kw in ['return operation', 'subtraction', 'wrong return', 'returns hardcoded', 'negated return', 'assigning void return', 'throws exception', 'early return']): return 'METHOD_WRONG_RETURN_OPERATION'
        if any(kw in desc for kw in ['order', 'swapped']): return 'METHOD_PARAMETER_ORDER_ERROR'
        if any(kw in desc for kw in ['missing return']): return 'METHOD_MISSING_RETURN'
        if any(kw in desc for kw in ['ignored parameter', 'pass by value', 'pass array reference']): return 'METHOD_IGNORED_PARAMETER'
        if any(kw in desc for kw in ['wrong call', 'calling non-static', 'removed static', 'method inside method', 'recursion', 'missing return type space']): return 'METHOD_WRONG_CALL'
        return 'METHOD_WRONG_CALL'
        
    elif label == 'CORRECT':
        return 'CORRECT_NO_ERROR'
        
    return 'UNKNOWN'

def main():
    print("Loading final_merged_dataset.csv...")
    df = pd.read_csv('D:/Work/Research_ML_Dataset/processed/final_merged_dataset.csv')
    original_len = len(df)
    
    print("Mapping reason labels...")
    df['reason_label'] = df.apply(map_reason, axis=1)
    
    # Validation 1: Same number of rows
    assert len(df) == original_len, f"Row count mismatch! Expected {original_len}, got {len(df)}"
    print(f"Validation 1 Passed: Dataset has {len(df)} rows.")
    
    # Validation 2: No missing reason_label values
    missing_count = df['reason_label'].isnull().sum()
    assert missing_count == 0, f"Found {missing_count} missing reason_labels"
    unknown_count = (df['reason_label'] == 'UNKNOWN').sum()
    assert unknown_count == 0, f"Found {unknown_count} UNKNOWN reason_labels"
    print("Validation 2 Passed: No missing or UNKNOWN reason_label values.")
    
    # Save the new dataset
    output_path = 'D:/Work/Research_ML_Dataset/processed/final_dataset_with_reason_labels.csv'
    cols = list(df.columns)
    # Ensure reason_label is added, maybe move it right after 'error_type'
    if 'reason_label' in cols:
        cols.remove('reason_label')
        idx = cols.index('error_type') + 1
        cols.insert(idx, 'reason_label')
        df = df[cols]
        
    df.to_csv(output_path, index=False)
    print(f"\nSaved dataset with reason labels to: {output_path}")
    
    # Validation 3: Print count by broad label
    print("\nValidation 3: Count by broad label")
    print(df['label'].value_counts())
    
    # Validation 4: Print count by reason_label
    print("\nValidation 4: Count by reason_label")
    reason_counts = df['reason_label'].value_counts()
    print(reason_counts)
    
    # Validation 5: Create processed/reason_label_summary.csv
    summary_path = 'D:/Work/Research_ML_Dataset/processed/reason_label_summary.csv'
    reason_counts.to_csv(summary_path, header=['count'])
    print(f"\nValidation 5 Passed: Created {summary_path}")
    
    # Validation 6: Show 5 sample rows for each broad label
    print("\nValidation 6: Sample rows per broad label")
    for label in df['label'].unique():
        print(f"\n--- Samples for {label} ---")
        sample_df = df[df['label'] == label].head(5)
        for _, row in sample_df.iterrows():
            print(f"File: {row['filename']}")
            print(f"Label: {row['label']}")
            print(f"Error Description: {row['error_description']}")
            print(f"Reason Label: {row['reason_label']}")
            print("-" * 40)

if __name__ == "__main__":
    main()
