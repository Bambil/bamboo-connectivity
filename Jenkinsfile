node {
	stage "Prepare environment"
		checkout scm
		docker.image('node').inside {
			stage "Checkout and build deps"
				sh "npm install"

				stage "Test and validate"
				sh "npm install gulp-cli && ./node_modules/.bin/gulp"
		}
}
