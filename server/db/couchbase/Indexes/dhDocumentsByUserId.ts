export default 'CREATE INDEX `dh_documents_by_userId` ON `docuHub`((split((meta().`id`), "::")[1]),`createdBy`,`sharedTo`,`id`) WHERE ((split((meta().`id`), "::")[1]) = "richTextDocument")';
