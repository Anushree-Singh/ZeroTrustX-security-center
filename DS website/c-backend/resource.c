#include <stdio.h>
#include "resource.h"

static Resource resources[100];
static int totalResources = 0;

void initResources(void) {
    totalResources = 0;
}

int addResource(Resource resource) {
    int i;
    if (totalResources >= 100) return 0;
    for (i = 0; i < totalResources; i++)
        if (resources[i].resourceID == resource.resourceID) return 0;
    resources[totalResources++] = resource;
    return 1;
}

Resource *getResource(int resourceID) {
    int i;
    for (i = 0; i < totalResources; i++)
        if (resources[i].resourceID == resourceID) return &resources[i];
    return NULL;
}

void listResources(void) {
    int i;
    printf("\n--- CLOUD RESOURCES ---\n");
    for (i = 0; i < totalResources; i++)
        printf("ID: %d | %s | Required role: %s\n",
               resources[i].resourceID, resources[i].name,
               resources[i].requiredRole);
}

int resourceCount(void) {
    return totalResources;
}
