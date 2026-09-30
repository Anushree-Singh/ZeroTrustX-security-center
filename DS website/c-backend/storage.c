#include <stdio.h>
#include "storage.h"
#include "user.h"
#include "resource.h"
#include "log.h"
#include "queue.h"

int saveUsers(const char *filename) {
    FILE *fp = fopen(filename, "w");
    int i;
    (void)i;
    if (!fp) return 0;
    /* User hash-table contents are exported through a simple scan of IDs.
       The application reserves IDs 1..10000 for this educational version. */
    for (i = 1; i <= 10000; i++) {
        User *u = getUser(i);
        if (u != NULL)
            fprintf(fp, "%d|%s|%s|%s|%d\n", u->userID, u->name,
                    u->role, u->deviceID, u->blocked);
    }
    fclose(fp);
    return 1;
}

int loadUsers(const char *filename) {
    FILE *fp = fopen(filename, "r");
    User u;
    if (!fp) return 0;
    while (fscanf(fp, "%d|%49[^|]|%19[^|]|%29[^|]|%d\n",
                  &u.userID, u.name, u.role, u.deviceID, &u.blocked) == 5)
        addUser(u);
    fclose(fp);
    return 1;
}

int saveResources(const char *filename) {
    FILE *fp = fopen(filename, "w");
    int i;
    if (!fp) return 0;
    /* Resource IDs are exported over the same demo range. */
    for (i = 1; i <= 10000; i++) {
        Resource *r = getResource(i);
        if (r != NULL)
            fprintf(fp, "%d|%s|%s\n", r->resourceID, r->name, r->requiredRole);
    }
    fclose(fp);
    return 1;
}

int loadResources(const char *filename) {
    FILE *fp = fopen(filename, "r");
    Resource r;
    if (!fp) return 0;
    while (fscanf(fp, "%d|%59[^|]|%19[^\n]\n",
                  &r.resourceID, r.name, r.requiredRole) == 3)
        addResource(r);
    fclose(fp);
    return 1;
}

int saveLogs(const char *filename) {
    FILE *fp = fopen(filename, "w");
    LogNode *p;
    if (!fp) return 0;
    p = getLogHead();
    while (p != NULL) {
        fprintf(fp, "%d|%d|%d|%d|%s|%s\n", p->requestID, p->userID,
                p->resourceID, p->riskScore, p->decision, p->reason);
        p = p->next;
    }
    fclose(fp);
    return 1;
}

int loadLogs(const char *filename) {
    FILE *fp = fopen(filename, "r");
    int requestID, userID, resourceID, risk;
    char decision[20], reason[MAX_REASON];
    if (!fp) return 0;
    while (fscanf(fp, "%d|%d|%d|%d|%19[^|]|%99[^\n]\n",
                  &requestID, &userID, &resourceID, &risk,
                  decision, reason) == 6)
        addLog(requestID, userID, resourceID, risk, decision, reason);
    fclose(fp);
    return 1;
}

int saveQueue(const char *filename) {
    FILE *fp = fopen(filename, "w");
    int count, i;
    if (!fp) return 0;
    count = queueCount();
    for (i = 0; i < count; i++) {
        AccessRequest *r = getQueueItemAt(i);
        if (r) {
            fprintf(fp, "%d|%d|%d|%s|%d|%d|%d|%d\n",
                    r->requestID, r->userID, r->resourceID, r->deviceID,
                    r->unknownDevice, r->unusualTime, r->unusualLocation, r->riskScore);
        }
    }
    fclose(fp);
    return 1;
}

int loadQueue(const char *filename) {
    FILE *fp = fopen(filename, "r");
    AccessRequest r;
    if (!fp) return 0;
    initQueue();
    while (fscanf(fp, "%d|%d|%d|%29[^|]|%d|%d|%d|%d\n",
                  &r.requestID, &r.userID, &r.resourceID, r.deviceID,
                  &r.unknownDevice, &r.unusualTime, &r.unusualLocation, &r.riskScore) == 8) {
        enqueue(r);
    }
    fclose(fp);
    return 1;
}
