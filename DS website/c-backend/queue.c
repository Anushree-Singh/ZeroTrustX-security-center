#include <stdio.h>
#include "queue.h"

static AccessRequest items[QUEUE_SIZE];
static int front = 0;
static int rear = 0;
static int count = 0;

void initQueue(void) {
    front = 0;
    rear = 0;
    count = 0;
}

int enqueue(AccessRequest request) {
    if (count == QUEUE_SIZE) return 0;
    items[rear] = request;
    rear = (rear + 1) % QUEUE_SIZE;
    count++;
    return 1;
}

int dequeue(AccessRequest *request) {
    if (count == 0) return 0;
    *request = items[front];
    front = (front + 1) % QUEUE_SIZE;
    count--;
    return 1;
}

int queueEmpty(void) { return count == 0; }
int queueFull(void) { return count == QUEUE_SIZE; }
int queueCount(void) { return count; }

void showQueue(void) {
    int i, index;
    printf("\nPending requests: %d\n", count);
    for (i = 0; i < count; i++) {
        index = (front + i) % QUEUE_SIZE;
        printf("Request %d | User %d | Resource %d | Risk %d\n",
               items[index].requestID, items[index].userID,
               items[index].resourceID, items[index].riskScore);
    }
}

int getQueueFront(void) { return front; }
int getQueueRear(void) { return rear; }

AccessRequest *getQueueItemAt(int i) {
    if (i < 0 || i >= count) return NULL;
    return &items[(front + i) % QUEUE_SIZE];
}
