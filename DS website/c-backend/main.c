#include <stdio.h>
#include <string.h>
#include "common.h"
#include "user.h"
#include "resource.h"
#include "queue.h"
#include "log.h"
#include "session.h"
#include "security.h"
#include "storage.h"

static int nextRequestID = 1;

void registerUserMenu(void) {
    User u;
    printf("\nUser ID: "); scanf("%d", &u.userID);
    printf("Name: "); scanf(" %49[^\n]", u.name);
    printf("Role: "); scanf("%19s", u.role);
    printf("Device ID: "); scanf("%29s", u.deviceID);
    u.blocked = 0;

    if (addUser(u)) printf("User added.\n");
    else printf("Could not add user; ID may already exist.\n");
}

void addResourceMenu(void) {
    Resource r;
    printf("\nResource ID: "); scanf("%d", &r.resourceID);
    printf("Resource name: "); scanf(" %59[^\n]", r.name);
    printf("Required role: "); scanf("%19s", r.requiredRole);

    if (addResource(r)) printf("Resource added.\n");
    else printf("Could not add resource; ID may already exist.\n");
}

void submitRequestMenu(void) {
    AccessRequest r;
    printf("\nUser ID: "); scanf("%d", &r.userID);
    if (getUser(r.userID) == NULL) {
        printf("User does not exist.\n");
        return;
    }

    printf("Resource ID: "); scanf("%d", &r.resourceID);
    if (getResource(r.resourceID) == NULL) {
        printf("Resource does not exist.\n");
        return;
    }

    printf("Device ID: "); scanf("%29s", r.deviceID);
    printf("Unknown device? (1/0): "); scanf("%d", &r.unknownDevice);
    printf("Unusual time? (1/0): "); scanf("%d", &r.unusualTime);
    printf("Unusual location? (1/0): "); scanf("%d", &r.unusualLocation);

    r.requestID = nextRequestID++;
    r.riskScore = calculateRisk(r.unknownDevice, r.unusualTime,
                                 r.unusualLocation);

    if (enqueue(r)) printf("Request %d added to circular queue. Risk: %d\n",
                           r.requestID, r.riskScore);
    else printf("Queue is full.\n");
}

void revalidateMenu(void) {
    int id, result;
    char device[MAX_DEVICE];

    printf("\nSession ID: "); scanf("%d", &id);
    printf("Current device ID: "); scanf("%29s", device);
    result = revalidateSession(id, device);

    if (result == 1) printf("Session remains valid.\n");
    else if (result == -1) printf("Device changed. Session revoked.\n");
    else printf("Session not found or inactive.\n");
}

void adminMenu(void) {
    int choice, id;
    do {
        printf("\n--- ADMIN CONTROLS ---\n");
        printf("1. Block user\n2. Unblock user\n3. Revalidate session\n4. Back\nChoice: ");
        scanf("%d", &choice);

        if (choice == 1) {
            printf("User ID: "); scanf("%d", &id);
            printf(blockUser(id) ? "User blocked.\n" : "User not found.\n");
        } else if (choice == 2) {
            printf("User ID: "); scanf("%d", &id);
            printf(unblockUser(id) ? "User unblocked.\n" : "User not found.\n");
        } else if (choice == 3) {
            revalidateMenu();
        }
    } while (choice != 4);
}

void dashboard(void) {
    printf("\n--- DASHBOARD ---\n");
    printf("Users: %d\n", userCount());
    printf("Resources: %d\n", resourceCount());
    printf("Pending requests: %d\n", queueCount());
    printf("Processed logs: %d\n", totalLogs());
    printf("High-risk logs: %d\n", highRiskLogs());
    printf("Active sessions: %d\n", activeSessionCount());
}

void saveAll(void) {
    saveUsers("users.txt");
    saveResources("resources.txt");
    saveLogs("logs.txt");
    saveSessions("sessions.txt");
    saveQueue("queue.txt");
    printf("\nData saved.\n");
}

int main(void) {
    int choice, id;

    initUsers();
    initResources();
    initQueue();

    loadUsers("users.txt");
    loadResources("resources.txt");
    loadLogs("logs.txt");
    loadSessions("sessions.txt");
    loadQueue("queue.txt");

    do {
        printf("\n========================================\n");
        printf("             ZEROTRUSTX V2\n");
        printf("========================================\n");
        printf("1. Register user\n");
        printf("2. List users\n");
        printf("3. Add cloud resource\n");
        printf("4. List resources\n");
        printf("5. Submit access request\n");
        printf("6. Show pending queue\n");
        printf("7. Process one request\n");
        printf("8. Show access logs\n");
        printf("9. Monitor threats\n");
        printf("10. Show active sessions\n");
        printf("11. Revoke session\n");
        printf("12. Admin controls\n");
        printf("13. Dashboard\n");
        printf("14. Save data\n");
        printf("15. Exit\n");
        printf("Choice: ");
        if (scanf("%d", &choice) != 1) break;

        switch (choice) {
            case 1: registerUserMenu(); break;
            case 2: listUsers(); break;
            case 3: addResourceMenu(); break;
            case 4: listResources(); break;
            case 5: submitRequestMenu(); break;
            case 6: showQueue(); break;
            case 7: processOneRequest(); break;
            case 8: showLogs(); break;
            case 9: monitorThreats(); break;
            case 10: showSessions(); break;
            case 11:
                printf("Session ID: "); scanf("%d", &id);
                printf(revokeSession(id) ? "Session revoked.\n" :
                       "Session not found or inactive.\n");
                break;
            case 12: adminMenu(); break;
            case 13: dashboard(); break;
            case 14: saveAll(); break;
            case 15: saveAll(); freeLogs(); clearUsers();
                     printf("Goodbye.\n"); break;
            default: printf("Invalid choice.\n");
        }
    } while (choice != 15);

    return 0;
}
