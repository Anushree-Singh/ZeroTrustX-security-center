#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "log.h"

static LogNode *head = NULL;
static int logs = 0;

void addLog(int requestID, int userID, int resourceID, int riskScore,
            const char *decision, const char *reason) {
    LogNode *node = (LogNode *)malloc(sizeof(LogNode));
    if (node == NULL) return;

    node->requestID = requestID;
    node->userID = userID;
    node->resourceID = resourceID;
    node->riskScore = riskScore;
    snprintf(node->decision, sizeof(node->decision), "%s", decision);
    snprintf(node->reason, sizeof(node->reason), "%s", reason);
    node->next = head;
    head = node;
    logs++;
}

void showLogs(void) {
    LogNode *p = head;
    if (p == NULL) {
        printf("\nNo logs available.\n");
        return;
    }
    printf("\n--- ACCESS LOGS ---\n");
    while (p != NULL) {
        printf("Request: %d | User: %d | Resource: %d | Risk: %d | %s | %s\n",
               p->requestID, p->userID, p->resourceID, p->riskScore,
               p->decision, p->reason);
        p = p->next;
    }
}

int deniedCountForUser(int userID) {
    int count = 0;
    LogNode *p = head;
    while (p != NULL) {
        if (p->userID == userID && strcmp(p->decision, "DENIED") == 0)
            count++;
        p = p->next;
    }
    return count;
}

int totalLogs(void) { return logs; }

int highRiskLogs(void) {
    int count = 0;
    LogNode *p = head;
    while (p != NULL) {
        if (p->riskScore >= 60) count++;
        p = p->next;
    }
    return count;
}

LogNode *getLogHead(void) { return head; }

void freeLogs(void) {
    LogNode *p = head, *next;
    while (p != NULL) {
        next = p->next;
        free(p);
        p = next;
    }
    head = NULL;
    logs = 0;
}
