export default 'CREATE INDEX `dh_users_by_email` ON `docuHub`(`email`,(split((meta().`id`), "::")[2])) WHERE ((split((meta().`id`), "::")[1]) = "user")';
