.SILENT:
.PHONY: build test

## Colors
COLOR_RESET   = \033[0m
COLOR_INFO    = \033[32m
COLOR_COMMENT = \033[33m

plugins = cupidon cupidon-client http graphql sequelize users
base :=	$(shell pwd )

setup: 		setup-components setup-framework setup-plugins

compile:	setup compile-components compile-framework compile-plugins

link: 		link-components link-framework link-plugins

setup-components:
	printf "${COLOR_INFO} - Setup components...${COLOR_RESET}\n"
	cd packages/components/ && yarn

compile-components:
	printf "${COLOR_INFO} - Building components...${COLOR_RESET}\n"
	cd packages/components/ && yarn build && cd build && yarn link

link-components:
	cd packages/components/build && yarn link

setup-framework:
	printf "${COLOR_INFO} - Setup framework...${COLOR_RESET}\n"
	cd packages/framework/ && yarn

compile-framework:
	printf "${COLOR_INFO} - Compiling framework...${COLOR_RESET}\n"
	cd packages/framework/ && yarn link @lovejs/components && yarn build && cd build && yarn link

link-framework:
	cd packages/framework/build && yarn link

setup-plugins:
	for plugin in ${plugins}; do \
		printf "${COLOR_INFO} -  Setup plugin '$$plugin' ...${COLOR_RESET}\n"; \
    	cd ${base}/packages/plugins/${plugin} && yarn; \
	done;

compile-plugins: compile-plugins-generic compile-cupidon compile-cupidon-client compile-http compile-graphql compile-sequelize compile-users

link-plugins: link-cupidon link-cupidon-client link-http link-graphql link-sequelize link-users

compile-plugins-generic:
	for plugin in ${plugins}; do \
		printf "${COLOR_INFO} -  Compiling plugin '$$plugin' ...${COLOR_RESET}\n"; \
    	cd ${base}/packages/plugins/${plugin} && yarn link @lovejs/components && yarn link @lovejs/framework; \
	done;

compile-cupidon:
	cd ${base}/packages/plugins/cupidon && yarn build && cd build && yarn link

link-cupidon:
	cd ${base}/packages/plugins/cupidon/build && yarn link

compile-cupidon-client:
	cd ${base}/packages/plugins/cupidon-client && yarn build && yarn link

link-cupidon:
	cd ${base}/packages/plugins/cupidon-client && yarn link

compile-http:
	cd ${base}/packages/plugins/http && yarn link @lovejs/cupidon && yarn build && cd build && yarn link

link-http:
	cd ${base}/packages/plugins/http/build && yarn link

compile-graphql:
	cd ${base}/packages/plugins/graphql && yarn link @lovejs/cupidon && yarn build && cd build && yarn link

link-graphql:
	cd ${base}/packages/plugins/graphql/build && yarn link

compile-sequelize:
	cd ${base}/packages/plugins/sequelize && yarn link @lovejs/cupidon && yarn link @lovejs/graphql && yarn build && cd build && yarn link

link-sequelize:
	cd ${base}/packages/plugins/sequelize/build && yarn link	

compile-users:
	cd ${base}/packages/plugins/user && yarn link @lovejs/cupidon && yarn link @lovejs/sequelize && yarn link @lovejs/graphql && yarn build && cd build && yarn link		

link-users:
	cd ${base}/packages/plugins/users/build && yarn link	