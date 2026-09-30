#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "common.h"
#include "user.h"
#include "resource.h"
#include "queue.h"
#include "log.h"
#include "session.h"
#include "security.h"
#include "storage.h"

/* Structure of Hash table node from user.c */
typedef struct UserNode {
    User data;
    struct UserNode *next;
} UserNode;

/* We define a safe JSON string print helper */
static void printJsonString(const char *str) {
    if (!str) {
        printf("\"\"");
        return;
    }
    putchar('"');
    while (*str) {
        if (*str == '"') printf("\\\"");
        else if (*str == '\\') printf("\\\\");
        else if (*str == '\n') printf("\\n");
        else if (*str == '\r') printf("\\r");
        else if (*str == '\t') printf("\\t");
        else putchar(*str);
        str++;
    }
    putchar('"');
}

static void loadAllState(void) {
    initUsers();
    initResources();
    initQueue();

    loadUsers("users.txt");
    loadResources("resources.txt");
    loadLogs("logs.txt");
    loadSessions("sessions.txt");
    loadQueue("queue.txt");
}

static void saveAllState(void) {
    saveUsers("users.txt");
    saveResources("resources.txt");
    saveLogs("logs.txt");
    saveSessions("sessions.txt");
    saveQueue("queue.txt");
}

/* Helper to seed realistic college demo data if empty */
static void seedDemoData(void) {
    User u1 = {101, "Alice Smith", "SecOps", "DEV-SEC-01", 0};
    User u2 = {102, "Bob Miller", "Developer", "DEV-DEV-02", 0};
    User u3 = {103, "Charlie Davis", "Auditor", "DEV-AUD-03", 0};
    User u4 = {104, "David Kumar", "Admin", "DEV-ADM-04", 0};
    User u5 = {105, "Eve Johnson", "Intern", "DEV-INT-05", 1}; /* Blocked user */
    User u6 = {106, "Frank Chen", "Developer", "DEV-DEV-06", 0};

    Resource r1 = {201, "AWS Core Production DB", "Admin"};
    Resource r2 = {202, "Kubernetes Prod Cluster", "SecOps"};
    Resource r3 = {203, "GitLab Enterprise Repo", "Developer"};
    Resource r4 = {204, "Cloud Compliance Vault", "Auditor"};
    Resource r5 = {205, "Payment Gateway API", "Admin"};

    addUser(u1);
    addUser(u2);
    addUser(u3);
    addUser(u4);
    addUser(u5);
    addUser(u6);

    addResource(r1);
    addResource(r2);
    addResource(r3);
    addResource(r4);
    addResource(r5);

    /* Initial logs demonstrating real C Zero Trust decisions */
    addLog(1, 104, 201, 0, "GRANTED", "Identity, role and risk checks passed");
    createSession(104, 201, "DEV-ADM-04");

    addLog(2, 102, 203, 0, "GRANTED", "Identity, role and risk checks passed");
    createSession(102, 203, "DEV-DEV-02");

    addLog(3, 105, 201, 0, "DENIED", "User is blocked");
    addLog(4, 102, 201, 0, "DENIED", "Insufficient privileges");
    addLog(5, 101, 202, 50, "REVIEW", "Additional verification required");
    addLog(6, 103, 204, 75, "REVIEW", "High risk request");

    /* Initial pending queue items in Circular Queue */
    AccessRequest q1 = {7, 101, 202, "DEV-SEC-01", 0, 1, 0, 20};
    AccessRequest q2 = {8, 102, 203, "DEV-UNKNOWN-99", 1, 0, 1, 55};
    AccessRequest q3 = {9, 103, 204, "DEV-AUD-03", 0, 0, 0, 0};
    enqueue(q1);
    enqueue(q2);
    enqueue(q3);

    saveAllState();
}

static void dumpFullJson(void) {
    int i, count, first;
    LogNode *p;
    int granted = 0, denied = 0, review = 0;

    printf("{\n");

    /* Users array (from Hash Table) */
    printf("  \"users\": [\n");
    first = 1;
    for (i = 1; i <= 10000; i++) {
        User *u = getUser(i);
        if (u != NULL) {
            if (!first) printf(",\n");
            first = 0;
            printf("    {\"userID\": %d, \"name\": ", u->userID);
            printJsonString(u->name);
            printf(", \"role\": ");
            printJsonString(u->role);
            printf(", \"deviceID\": ");
            printJsonString(u->deviceID);
            printf(", \"blocked\": %d, \"bucket\": %d}", u->blocked, (u->userID % HASH_SIZE));
        }
    }
    printf("\n  ],\n");

    /* Resources array (from contiguous Array) */
    printf("  \"resources\": [\n");
    first = 1;
    count = resourceCount();
    for (i = 1; i <= 10000; i++) {
        Resource *r = getResource(i);
        if (r != NULL) {
            if (!first) printf(",\n");
            first = 0;
            printf("    {\"resourceID\": %d, \"name\": ", r->resourceID);
            printJsonString(r->name);
            printf(", \"requiredRole\": ");
            printJsonString(r->requiredRole);
            printf("}");
        }
    }
    printf("\n  ],\n");

    /* Circular Queue items */
    printf("  \"queue\": {\n");
    printf("    \"front\": %d,\n", getQueueFront());
    printf("    \"rear\": %d,\n", getQueueRear());
    printf("    \"count\": %d,\n", queueCount());
    printf("    \"capacity\": %d,\n", QUEUE_SIZE);
    printf("    \"items\": [\n");
    count = queueCount();
    for (i = 0; i < count; i++) {
        AccessRequest *q = getQueueItemAt(i);
        if (q != NULL) {
            if (i > 0) printf(",\n");
            printf("      {\"queueIndex\": %d, \"slot\": %d, \"requestID\": %d, \"userID\": %d, \"resourceID\": %d, \"deviceID\": ",
                   i, (getQueueFront() + i) % QUEUE_SIZE, q->requestID, q->userID, q->resourceID);
            printJsonString(q->deviceID);
            printf(", \"unknownDevice\": %d, \"unusualTime\": %d, \"unusualLocation\": %d, \"riskScore\": %d}",
                   q->unknownDevice, q->unusualTime, q->unusualLocation, q->riskScore);
        }
    }
    printf("\n    ]\n  },\n");

    /* Access Logs (from Singly Linked List) */
    printf("  \"logs\": [\n");
    p = getLogHead();
    first = 1;
    while (p != NULL) {
        if (!first) printf(",\n");
        first = 0;
        printf("    {\"requestID\": %d, \"userID\": %d, \"resourceID\": %d, \"riskScore\": %d, \"decision\": ",
               p->requestID, p->userID, p->resourceID, p->riskScore);
        printJsonString(p->decision);
        printf(", \"reason\": ");
        printJsonString(p->reason);
        printf("}");

        if (strcmp(p->decision, "GRANTED") == 0) granted++;
        else if (strcmp(p->decision, "DENIED") == 0) denied++;
        else if (strcmp(p->decision, "REVIEW") == 0) review++;

        p = p->next;
    }
    printf("\n  ],\n");

    /* Sessions (from Array) */
    printf("  \"sessions\": [\n");
    first = 1;
    count = totalSessionRecords();
    for (i = 0; i < count; i++) {
        Session *s = getSessionAt(i);
        if (s != NULL) {
            if (!first) printf(",\n");
            first = 0;
            printf("    {\"sessionID\": %d, \"userID\": %d, \"resourceID\": %d, \"deviceID\": ",
                   s->sessionID, s->userID, s->resourceID);
            printJsonString(s->deviceID);
            printf(", \"active\": %d}", s->active);
        }
    }
    printf("\n  ],\n");

    /* Threats detected by C backend logic */
    printf("  \"threats\": [\n");
    p = getLogHead();
    first = 1;
    while (p != NULL) {
        int deniedCount = deniedCountForUser(p->userID);
        if (p->riskScore >= 60 || deniedCount >= 3) {
            if (!first) printf(",\n");
            first = 0;
            printf("    {\"requestID\": %d, \"userID\": %d, \"resourceID\": %d, \"riskScore\": %d, \"threatType\": ",
                   p->requestID, p->userID, p->resourceID, p->riskScore);
            if (p->riskScore >= 60 && deniedCount >= 3) {
                printJsonString("HIGH_RISK_AND_REPEATED_DENIAL");
            } else if (p->riskScore >= 60) {
                printJsonString("HIGH_RISK_ANOMALY");
            } else {
                printJsonString("REPEATED_DENIAL_BRUTE_FORCE");
            }
            printf(", \"deniedCount\": %d, \"decision\": ", deniedCount);
            printJsonString(p->decision);
            printf(", \"reason\": ");
            printJsonString(p->reason);
            printf("}");
        }
        p = p->next;
    }
    printf("\n  ],\n");

    /* Overall Summary Stats calculated by C backend */
    printf("  \"stats\": {\n");
    printf("    \"totalUsers\": %d,\n", userCount());
    printf("    \"totalResources\": %d,\n", resourceCount());
    printf("    \"pendingRequests\": %d,\n", queueCount());
    printf("    \"totalLogs\": %d,\n", totalLogs());
    printf("    \"highRiskLogs\": %d,\n", highRiskLogs());
    printf("    \"activeSessions\": %d,\n", activeSessionCount());
    printf("    \"grantedCount\": %d,\n", granted);
    printf("    \"deniedCount\": %d,\n", denied);
    printf("    \"reviewCount\": %d\n", review);
    printf("  }\n");

    printf("}\n");
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        loadAllState();
        dumpFullJson();
        return 0;
    }

    const char *cmd = argv[1];

    if (strcmp(cmd, "get-all") == 0 || strcmp(cmd, "status") == 0) {
        loadAllState();
        dumpFullJson();
        return 0;
    }

    if (strcmp(cmd, "clear-all") == 0) {
        initUsers();
        initResources();
        initQueue();
        freeLogs();
        /* Clear all flat files */
        FILE *f;
        f = fopen("users.txt", "w"); if (f) fclose(f);
        f = fopen("resources.txt", "w"); if (f) fclose(f);
        f = fopen("logs.txt", "w"); if (f) fclose(f);
        f = fopen("sessions.txt", "w"); if (f) fclose(f);
        f = fopen("queue.txt", "w"); if (f) fclose(f);
        dumpFullJson();
        return 0;
    }

    if (strcmp(cmd, "seed-demo") == 0) {
        loadAllState();
        seedDemoData();
        dumpFullJson();
        return 0;
    }

    if (strcmp(cmd, "calculate-risk") == 0) {
        if (argc < 5) {
            printf("{\"error\": \"Missing arguments for calculate-risk\"}\n");
            return 1;
        }
        int unk = atoi(argv[2]);
        int utime = atoi(argv[3]);
        int uloc = atoi(argv[4]);
        int score = calculateRisk(unk, utime, uloc);
        printf("{\"riskScore\": %d}\n", score);
        return 0;
    }

    if (strcmp(cmd, "add-user") == 0) {
        if (argc < 6) {
            printf("{\"error\": \"Missing arguments: add-user <id> <name> <role> <device>\"}\n");
            return 1;
        }
        loadAllState();
        User u;
        u.userID = atoi(argv[2]);
        snprintf(u.name, sizeof(u.name), "%s", argv[3]);
        snprintf(u.role, sizeof(u.role), "%s", argv[4]);
        snprintf(u.deviceID, sizeof(u.deviceID), "%s", argv[5]);
        u.blocked = 0;

        int res = addUser(u);
        if (res) {
            saveAllState();
            printf("{\"success\": true, \"message\": \"User created in hash table\", \"userID\": %d}\n", u.userID);
        } else {
            printf("{\"success\": false, \"error\": \"User ID already exists or invalid\"}\n");
        }
        return 0;
    }

    if (strcmp(cmd, "block-user") == 0) {
        if (argc < 3) {
            printf("{\"error\": \"Missing user ID\"}\n");
            return 1;
        }
        loadAllState();
        int uid = atoi(argv[2]);
        int ok = blockUser(uid);
        if (ok) {
            saveAllState();
            printf("{\"success\": true, \"message\": \"User blocked\", \"userID\": %d}\n", uid);
        } else {
            printf("{\"success\": false, \"error\": \"User not found\"}\n");
        }
        return 0;
    }

    if (strcmp(cmd, "unblock-user") == 0) {
        if (argc < 3) {
            printf("{\"error\": \"Missing user ID\"}\n");
            return 1;
        }
        loadAllState();
        int uid = atoi(argv[2]);
        int ok = unblockUser(uid);
        if (ok) {
            saveAllState();
            printf("{\"success\": true, \"message\": \"User unblocked\", \"userID\": %d}\n", uid);
        } else {
            printf("{\"success\": false, \"error\": \"User not found\"}\n");
        }
        return 0;
    }

    if (strcmp(cmd, "add-resource") == 0) {
        if (argc < 5) {
            printf("{\"error\": \"Missing arguments: add-resource <id> <name> <role>\"}\n");
            return 1;
        }
        loadAllState();
        Resource r;
        r.resourceID = atoi(argv[2]);
        snprintf(r.name, sizeof(r.name), "%s", argv[3]);
        snprintf(r.requiredRole, sizeof(r.requiredRole), "%s", argv[4]);

        int res = addResource(r);
        if (res) {
            saveAllState();
            printf("{\"success\": true, \"message\": \"Resource added to array\", \"resourceID\": %d}\n", r.resourceID);
        } else {
            printf("{\"success\": false, \"error\": \"Resource ID already exists or capacity reached\"}\n");
        }
        return 0;
    }

    if (strcmp(cmd, "submit-request") == 0) {
        /* submit-request <userID> <resourceID> <deviceID> <unknownDevice> <unusualTime> <unusualLocation> [autoProcess] */
        if (argc < 8) {
            printf("{\"error\": \"Missing arguments: submit-request <userID> <resourceID> <deviceID> <unknownDevice> <unusualTime> <unusualLocation>\"}\n");
            return 1;
        }
        loadAllState();
        int uid = atoi(argv[2]);
        int rid = atoi(argv[3]);
        const char *dev = argv[4];
        int unk = atoi(argv[5]);
        int utime = atoi(argv[6]);
        int uloc = atoi(argv[7]);
        int autoProcess = (argc >= 9 && atoi(argv[8]) == 1) ? 1 : 0;

        User *u = getUser(uid);
        if (u == NULL) {
            printf("{\"success\": false, \"error\": \"User does not exist in hash table\"}\n");
            return 0;
        }

        Resource *res = getResource(rid);
        if (res == NULL) {
            printf("{\"success\": false, \"error\": \"Resource does not exist in cloud resources\"}\n");
            return 0;
        }

        /* Calculate highest ID so far */
        int nextReqID = 1;
        LogNode *lp = getLogHead();
        while (lp != NULL) {
            if (lp->requestID >= nextReqID) nextReqID = lp->requestID + 1;
            lp = lp->next;
        }
        int qcnt = queueCount();
        int qi;
        for (qi = 0; qi < qcnt; qi++) {
            AccessRequest *it = getQueueItemAt(qi);
            if (it && it->requestID >= nextReqID) nextReqID = it->requestID + 1;
        }

        AccessRequest req;
        req.requestID = nextReqID;
        req.userID = uid;
        req.resourceID = rid;
        snprintf(req.deviceID, sizeof(req.deviceID), "%s", dev);
        req.unknownDevice = unk;
        req.unusualTime = utime;
        req.unusualLocation = uloc;
        req.riskScore = calculateRisk(unk, utime, uloc);

        if (!enqueue(req)) {
            printf("{\"success\": false, \"error\": \"Circular queue is full (capacity %d)\"}\n", QUEUE_SIZE);
            return 0;
        }

        if (autoProcess) {
            AccessRequest processed;
            char decision[20];
            char reason[MAX_REASON];
            int sessID = 0;
            if (processOneRequestDetailed(&processed, decision, reason, &sessID)) {
                saveAllState();
                printf("{\n");
                printf("  \"success\": true,\n");
                printf("  \"autoProcessed\": true,\n");
                printf("  \"requestID\": %d,\n", processed.requestID);
                printf("  \"userID\": %d,\n", processed.userID);
                printf("  \"resourceID\": %d,\n", processed.resourceID);
                printf("  \"riskScore\": %d,\n", processed.riskScore);
                printf("  \"decision\": "); printJsonString(decision); printf(",\n");
                printf("  \"reason\": "); printJsonString(reason); printf(",\n");
                printf("  \"sessionID\": %d\n", sessID);
                printf("}\n");
                return 0;
            }
        }

        saveAllState();
        printf("{\n");
        printf("  \"success\": true,\n");
        printf("  \"autoProcessed\": false,\n");
        printf("  \"message\": \"Request added to Circular Queue\",\n");
        printf("  \"requestID\": %d,\n", req.requestID);
        printf("  \"userID\": %d,\n", req.userID);
        printf("  \"resourceID\": %d,\n", req.resourceID);
        printf("  \"riskScore\": %d,\n", req.riskScore);
        printf("  \"queueCount\": %d,\n", queueCount());
        printf("  \"queueFront\": %d,\n", getQueueFront());
        printf("  \"queueRear\": %d\n", getQueueRear());
        printf("}\n");
        return 0;
    }

    if (strcmp(cmd, "process-request") == 0 || strcmp(cmd, "process-one") == 0) {
        loadAllState();
        AccessRequest processed;
        char decision[20];
        char reason[MAX_REASON];
        int sessID = 0;

        int ok = processOneRequestDetailed(&processed, decision, reason, &sessID);
        if (!ok) {
            printf("{\"success\": false, \"error\": \"No pending requests in Circular Queue\"}\n");
            return 0;
        }

        saveAllState();
        printf("{\n");
        printf("  \"success\": true,\n");
        printf("  \"requestID\": %d,\n", processed.requestID);
        printf("  \"userID\": %d,\n", processed.userID);
        printf("  \"resourceID\": %d,\n", processed.resourceID);
        printf("  \"riskScore\": %d,\n", processed.riskScore);
        printf("  \"decision\": "); printJsonString(decision); printf(",\n");
        printf("  \"reason\": "); printJsonString(reason); printf(",\n");
        printf("  \"sessionID\": %d,\n", sessID);
        printf("  \"queueRemaining\": %d\n", queueCount());
        printf("}\n");
        return 0;
    }

    if (strcmp(cmd, "revoke-session") == 0) {
        if (argc < 3) {
            printf("{\"error\": \"Missing session ID\"}\n");
            return 1;
        }
        loadAllState();
        int sid = atoi(argv[2]);
        int ok = revokeSession(sid);
        if (ok) {
            saveAllState();
            printf("{\"success\": true, \"message\": \"Session revoked\", \"sessionID\": %d}\n", sid);
        } else {
            printf("{\"success\": false, \"error\": \"Session not found or already inactive\"}\n");
        }
        return 0;
    }

    if (strcmp(cmd, "revalidate-session") == 0) {
        if (argc < 4) {
            printf("{\"error\": \"Missing arguments: revalidate-session <sessionID> <currentDevice>\"}\n");
            return 1;
        }
        loadAllState();
        int sid = atoi(argv[2]);
        const char *dev = argv[3];

        int result = revalidateSession(sid, dev);
        saveAllState();

        if (result == 1) {
            printf("{\"success\": true, \"result\": 1, \"status\": \"VALID\", \"message\": \"Device verified. Session remains active.\", \"sessionID\": %d}\n", sid);
        } else if (result == -1) {
            printf("{\"success\": true, \"result\": -1, \"status\": \"REVOKED\", \"message\": \"Device mismatch detected! Session has been automatically revoked by Zero Trust continuous validation.\", \"sessionID\": %d}\n", sid);
        } else {
            printf("{\"success\": false, \"result\": 0, \"status\": \"NOT_FOUND\", \"error\": \"Session not found or already inactive\"}\n");
        }
        return 0;
    }

    printf("{\"error\": \"Unknown command\"}\n");
    return 1;
}
