#include <stdio.h>
#include <string.h>
#include "security.h"
#include "user.h"
#include "resource.h"
#include "queue.h"
#include "log.h"
#include "session.h"

int calculateRisk(int unknownDevice, int unusualTime, int unusualLocation) {
    int score = 0;
    if (unknownDevice) score += 30;
    if (unusualTime) score += 20;
    if (unusualLocation) score += 25;
    return score;
}

int processOneRequestDetailed(AccessRequest *outReq, char *outDecision, char *outReason, int *outSessionID) {
    AccessRequest r;
    User *u;
    Resource *res;
    char decision[20], reason[MAX_REASON];
    int sessID = 0;

    if (!dequeue(&r)) {
        return 0; /* queue empty */
    }

    u = getUser(r.userID);
    res = getResource(r.resourceID);

    if (u == NULL || res == NULL) {
        strcpy(decision, "DENIED");
        strcpy(reason, "Invalid user or resource");
    } else if (u->blocked) {
        strcpy(decision, "DENIED");
        strcpy(reason, "User is blocked");
    } else if (strcmp(u->role, res->requiredRole) != 0) {
        strcpy(decision, "DENIED");
        strcpy(reason, "Insufficient privileges");
    } else if (r.riskScore >= 60) {
        strcpy(decision, "REVIEW");
        strcpy(reason, "High risk request");
    } else if (r.riskScore >= 30) {
        strcpy(decision, "REVIEW");
        strcpy(reason, "Additional verification required");
    } else {
        strcpy(decision, "GRANTED");
        strcpy(reason, "Identity, role and risk checks passed");
        sessID = createSession(r.userID, r.resourceID, r.deviceID);
    }

    addLog(r.requestID, r.userID, r.resourceID, r.riskScore, decision, reason);

    if (outReq) *outReq = r;
    if (outDecision) snprintf(outDecision, 20, "%s", decision);
    if (outReason) snprintf(outReason, MAX_REASON, "%s", reason);
    if (outSessionID) *outSessionID = sessID;

    return 1;
}

void processOneRequest(void) {
    AccessRequest r;
    char decision[20], reason[MAX_REASON];
    int sessID = 0;

    if (!processOneRequestDetailed(&r, decision, reason, &sessID)) {
        printf("\nNo pending requests.\n");
        return;
    }

    printf("\nRequest %d -> %s (%s)\n", r.requestID, decision, reason);
}

void monitorThreats(void) {
    LogNode *p = getLogHead();
    int found = 0;

    printf("\n--- THREAT MONITORING ---\n");
    while (p != NULL) {
        if (p->riskScore >= 60) {
            printf("High-risk request %d by user %d, score %d\n",
                   p->requestID, p->userID, p->riskScore);
            found = 1;
        }
        if (deniedCountForUser(p->userID) >= 3) {
            printf("Repeated-denial alert for user %d (%d denied requests)\n",
                   p->userID, deniedCountForUser(p->userID));
            found = 1;
        }
        p = p->next;
    }
    if (!found) printf("No suspicious activity detected.\n");
}
