#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "user.h"

typedef struct UserNode {
    User data;
    struct UserNode *next;
} UserNode;

static UserNode *table[HASH_SIZE];
static int totalUsers = 0;

static int hashID(int id) {
    if (id < 0) id = -id;
    return id % HASH_SIZE;
}

void initUsers(void) {
    int i;
    for (i = 0; i < HASH_SIZE; i++) table[i] = NULL;
    totalUsers = 0;
}

User *getUser(int userID) {
    UserNode *p = table[hashID(userID)];
    while (p != NULL) {
        if (p->data.userID == userID) return &p->data;
        p = p->next;
    }
    return NULL;
}

int findUserIndex(int userID) {
    return getUser(userID) != NULL ? 1 : -1;
}

int addUser(User user) {
    int h;
    UserNode *node;
    if (getUser(user.userID) != NULL) return 0;

    node = (UserNode *)malloc(sizeof(UserNode));
    if (node == NULL) return 0;

    node->data = user;
    h = hashID(user.userID);
    node->next = table[h];
    table[h] = node;
    totalUsers++;
    return 1;
}

void listUsers(void) {
    int i;
    UserNode *p;
    printf("\n--- USERS ---\n");
    for (i = 0; i < HASH_SIZE; i++) {
        p = table[i];
        while (p != NULL) {
            printf("ID: %d | Name: %s | Role: %s | Device: %s | %s\n",
                   p->data.userID, p->data.name, p->data.role,
                   p->data.deviceID, p->data.blocked ? "BLOCKED" : "ACTIVE");
            p = p->next;
        }
    }
}

int blockUser(int userID) {
    User *u = getUser(userID);
    if (u == NULL) return 0;
    u->blocked = 1;
    return 1;
}

int unblockUser(int userID) {
    User *u = getUser(userID);
    if (u == NULL) return 0;
    u->blocked = 0;
    return 1;
}

int userCount(void) {
    return totalUsers;
}

void clearUsers(void) {
    int i;
    UserNode *p, *next;
    for (i = 0; i < HASH_SIZE; i++) {
        p = table[i];
        while (p != NULL) {
            next = p->next;
            free(p);
            p = next;
        }
        table[i] = NULL;
    }
    totalUsers = 0;
}
