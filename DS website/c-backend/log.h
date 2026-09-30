#ifndef LOG_H
#define LOG_H
#include "common.h"

void addLog(int requestID, int userID, int resourceID, int riskScore,
            const char *decision, const char *reason);
void showLogs(void);
int deniedCountForUser(int userID);
int totalLogs(void);
int highRiskLogs(void);
void freeLogs(void);
LogNode *getLogHead(void);

#endif
