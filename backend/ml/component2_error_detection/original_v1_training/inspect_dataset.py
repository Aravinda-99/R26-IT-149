import pandas as pd

df = pd.read_csv('final_merged_dataset.csv')
print('Shape:', df.shape)
print('Columns:', df.columns.tolist())
print()
print('Label distribution:')
print(df['label'].value_counts())
print()
print('Unique error_descriptions per label:')
for lbl in df['label'].unique():
    sub = df[df['label']==lbl]['error_description'].unique()
    print(f'--- {lbl} ({len(sub)} unique) ---')
    for d in sub:
        print(' ', d)
    print()
