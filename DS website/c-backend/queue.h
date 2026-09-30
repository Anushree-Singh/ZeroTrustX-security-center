#ifndef QUEUE_H
#define QUEUE_H
#include "common.h"

void initQueue(void);
int enqueue(AccessRequest request);
int dequeue(AccessRequest *request);
int queueEmpty(void);
int queueFull(void);
int queueCount(void);
void showQueue(void);

/* Inspection helpers for web visualization and JSON export */
int getQueueFront(void);
int getQueueRear(void);
AccessRequest *getQueueItemAt(int i);

#endif
