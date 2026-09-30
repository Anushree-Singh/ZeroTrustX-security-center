#include <stdio.h>
#include <string.h>
#include "session.h"

static Session sessions[MAX_SESSIONS];
static int totalSessions = 0;
static int nextSessionID = 1;

int createSession(int userID, int resourceID, const char *deviceID) {
    if (totalSessions >= MAX_SESSIONS) return 0;
    sessions[totalSessions].sessionID = nextSessionID++;
    sessions[totalSessions].userID = userID;
    sessions[totalSessions].resourceID = resourceID;
    snprintf(sessions[totalSessions].deviceID, MAX_DEVICE, "%s", deviceID);
    sessions[totalSessions].active = 1;
    totalSessions++;
    return sessions[totalSessions - 1].sessionID;
}

void showSessions(void) {
    int i, found = 0;
    printf("\n--- ACTIVE SESSIONS ---\n");
    for (i = 0; i < totalSessions; i++) {
        if (sessions[i].active) {
            printf("Session: %d | User: %d | Resource: %d | Device: %s\n",
                   sessions[i].sessionID, sessions[i].userID,
                   sessions[i].resourceID, sessions[i].deviceID);
            found = 1;
        }
    }
    if (!found) printf("No active sessions.\n");
}

int revokeSession(int sessionID) {
    int i;
    for (i = 0; i < totalSessions; i++) {
        if (sessions[i].sessionID == sessionID && sessions[i].active) {
            sessions[i].active = 0;
            return 1;
        }
    }
    return 0;
}

int revalidateSession(int sessionID, const char *currentDevice) {
    int i;
    for (i = 0; i < totalSessions; i++) {
        if (sessions[i].sessionID == sessionID && sessions[i].active) {
            if (strcmp(sessions[i].deviceID, currentDevice) != 0) {
                sessions[i].active = 0;
                return -1;
            }
            return 1;
        }
    }
    return 0;
}

int activeSessionCount(void) {
    int i, count = 0;
    for (i = 0; i < totalSessions; i++)
        if (sessions[i].active) count++;
    return count;
}

int saveSessions(const char *filename) {
    FILE *fp = fopen(filename, "w");
    int i;
    if (!fp) return 0;
    for (i = 0; i < totalSessions; i++)
        fprintf(fp, "%d|%d|%d|%s|%d\n", sessions[i].sessionID,
                sessions[i].userID, sessions[i].resourceID,
                sessions[i].deviceID, sessions[i].active);
    fclose(fp);
    return 1;
}

int loadSessions(const char *filename) {
    FILE *fp = fopen(filename, "r");
    Session s;
    if (!fp) return 0;
    while (fscanf(fp, "%d|%d|%d|%29[^|]|%d\n",
                  &s.sessionID, &s.userID, &s.resourceID,
                  s.deviceID, &s.active) == 5) {
        if (totalSessions < MAX_SESSIONS) {
            sessions[totalSessions++] = s;
            if (s.sessionID >= nextSessionID) nextSessionID = s.sessionID + 1;
        }
    }
    fclose(fp);
    return 1;
}

int totalSessionRecords(void) {
    return totalSessions;
}

Session *getSessionAt(int i) {
    if (i < 0 || i >= totalSessions) return NULL;
    return &sessions[i];
}
