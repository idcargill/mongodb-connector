db.createUser({
  user: 'user',
  pwd: 'fishSticks',
  roles: [
    {
      role: 'readWrite',
      db: 'MyTestDB',
    },
  ],
});
