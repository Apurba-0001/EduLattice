const manualRoleChangeNotice = () => {
  const email = process.argv[2];
  const target = email || "<user-email>";

  console.log(
    "Role changes are intentionally disabled in the application API.",
  );
  console.log(
    "Update the MongoDB document manually if you need to change a role.",
  );
  console.log(
    `Example MongoDB shell update for ${target}: db.users.updateOne({ email: "${target}" }, { $set: { isAdmin: true } })`,
  );
  process.exit(1);
};

manualRoleChangeNotice();
