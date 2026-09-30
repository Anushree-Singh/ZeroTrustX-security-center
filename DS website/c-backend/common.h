#ifndef COMMON_H
#define COMMON_H

#define MAX_NAME 50
#define MAX_ROLE 20
#define MAX_DEVICE 30
#define MAX_RESOURCE_NAME 60
#define MAX_REASON 100
#define MAX_SESSIONS 100
#define QUEUE_SIZE 100
#define HASH_SIZE 31

typedef struct {
    int userID;
    char name[MAX_NAME];
    char role[MAX_ROLE];
    char deviceID[MAX_DEVICE];
    int blocked;
} User;

typedef struct {
    int resourceID;
    char name[MAX_RESOURCE_NAME];
    char requiredRole[MAX_ROLE];
} Resource;

typedef struct {
    int requestID;
    int userID;
    int resourceID;
    char deviceID[MAX_DEVICE];
    int unknownDevice;
    int unusualTime;
    int unusualLocation;
    int riskScore;
} AccessRequest;

typedef struct LogNode {
    int requestID;
    int userID;
    int resourceID;
    int riskScore;
    char decision[20];
    char reason[MAX_REASON];
    struct LogNode *next;
} LogNode;

typedef struct {
    int sessionID;
    int userID;
    int resourceID;
    char deviceID[MAX_DEVICE];
    int active;
} Session;

#endif
