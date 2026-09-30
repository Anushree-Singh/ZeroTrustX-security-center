#ifndef USER_H
#define USER_H
#include "common.h"

void initUsers(void);
int addUser(User user);
int findUserIndex(int userID);
User *getUser(int userID);
void listUsers(void);
int blockUser(int userID);
int unblockUser(int userID);
int userCount(void);
void clearUsers(void);

#endif
