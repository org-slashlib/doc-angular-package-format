
git remote add github https://github.com/org-slashlib/doc-angular-package-format.git
git remote add backup //.../git/@org.slashlib-doc-angular-package-format.git

.git/config add the following (3) lines:
[remote "origin"]
  url = https://github.com/org-slashlib/doc-angular-package-format.git
  url = //sl-01-00/SVN/git/@org.slashlib-doc-angular-package-format.git

You can then push to both repositories by issuing:

<code>git push origin master</code>

Or to a single one by issuing either of these commands:

<code>git push github master</code>  
<code>git push backup master</code>
