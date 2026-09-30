#ifndef SESSION_H
#define SESSION_H
#include "common.h"

int createSession(int userID, int resourceID, const char *deviceID);
void showSessions(void);
int revokeSession(int sessionID);
int revalidateSession(int sessionID, const char *currentDevice);
int activeSessionCount(void);
int saveSessions(const char *filename);
int loadSessions(const char *filename);

/* Inspection helpers for web API */
int totalSessionRecords(void);
Session *getSessionAt(int i);

#endif
