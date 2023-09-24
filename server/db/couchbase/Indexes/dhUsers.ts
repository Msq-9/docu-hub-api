export default 'CREATE INDEX `dh_users` ON `docuHub`((split((meta().`id`), "::")[1])) WHERE ((split((meta().`id`), "::")[1]) = "user")';
