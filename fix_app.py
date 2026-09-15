import sys
content = open("src/App.tsx").read()
# Removing duplicate lazy route
content = content.replace("const CaseStudiesListPage = lazy(() =>\n  import(\"./pages/CaseStudiesListPage\").then((m) => ({ default: m.CaseStudiesListPage })),\n)\n", "")
# Removing duplicate route
content = content.replace("          <Route path=\"/case-studies\" element={<CaseStudiesListPage />} />\n", "", 1)
open("src/App.tsx", "w").write(content)
