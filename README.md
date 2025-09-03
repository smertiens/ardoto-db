# Ardoto DB

Status: under development.

A standalone document-based database with large file handling included.

Ardoto DB offers a NoSQL-api with sqlite3 underneath for easy and intuitive handling of documents.
Custom indexing allows for fast searches within documents. Files can be saved as part of your document.
Ardoto DB stores all files outside of the sqlite3-database on a separate filesystem and maintains a reference
to the file within the database. 

