#ifndef RESOURCE_H
#define RESOURCE_H
#include "common.h"

void initResources(void);
int addResource(Resource resource);
Resource *getResource(int resourceID);
void listResources(void);
int resourceCount(void);

#endif
