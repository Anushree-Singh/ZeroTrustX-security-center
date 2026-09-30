#ifndef STORAGE_H
#define STORAGE_H

int saveUsers(const char *filename);
int loadUsers(const char *filename);
int saveResources(const char *filename);
int loadResources(const char *filename);
int saveLogs(const char *filename);
int loadLogs(const char *filename);

/* Queue persistence */
int saveQueue(const char *filename);
int loadQueue(const char *filename);

#endif
