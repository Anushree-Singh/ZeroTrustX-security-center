#ifndef SECURITY_H
#define SECURITY_H
#include "common.h"

int calculateRisk(int unknownDevice, int unusualTime, int unusualLocation);
void processOneRequest(void);
void monitorThreats(void);

/* Helper for API bridge */
int processOneRequestDetailed(AccessRequest *outReq, char *outDecision, char *outReason, int *outSessionID);

#endif
