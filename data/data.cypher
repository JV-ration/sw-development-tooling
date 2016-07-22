// Delete all nodes and relationships from the database. Execute commented out query below
// MATCH (n) DETACH DELETE n

// Create vendors
CREATE (v_atlassian: Vendor {
    name: "Atlassian"
})

// Create tools created by vendors
CREATE (t_jira: Tool {
    name: "Jira"
}) - [:CREATED_BY] -> (v_atlassian)

CREATE (modA:Module {
	uniqueId:11111,
	groupId:"groupId-A",
	artifactId:"artifactId-A",
	packaging:"packaging-A",
	classifier:"classifier-A",
	version:"version-A"
})
CREATE (modB:Module {
	uniqueId:22222,
	groupId:"groupId-B",
	artifactId:"artifactId-B",
	packaging:"packaging-B",
	classifier:"classifier-B",
	version:"version-B"
})

CREATE (modA)-[depends:DEPENDS]->(modB)
