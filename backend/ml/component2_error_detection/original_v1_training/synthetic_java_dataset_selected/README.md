# Curated Synthetic Java Programming Error Dataset

## Purpose
This dataset is a highly curated subset of exactly 2,000 files extracted from a larger procedurally generated pool of 10,000 synthetic Java files. It is specifically designed to train ML models to detect beginner programming errors, with a strong mathematical priority weighted towards **CONCEPTUAL** and **LOGIC** errors.

## Class Balance (Exactly 400 files per category)
- **LOOP_ERROR**: 400 files
- **VARIABLE_ERROR**: 400 files
- **ARRAY_ERROR**: 400 files
- **METHOD_ERROR**: 400 files
- **CORRECT**: 400 files

## Target Error Type Distribution
To avoid near-duplicates, files were sampled across dozens of distinct logic templates via stratified sampling. The distribution across the 1,600 non-correct files is strictly enforced:
- **CONCEPTUAL**: ~648 files (Misunderstandings of Java constructs)
- **LOGIC**: ~552 files (Flaws in algorithmic design)
- **RUNTIME**: 200 files (Exceptions thrown during execution)
- **SYNTAX**: 200 files (Compile-time errors)
- **NONE**: 400 files (Correct syntax)

## Validation
A `validate.py` script is included in this directory to programmatically verify that all 2,000 files exist and perfectly match `labels.csv`.
