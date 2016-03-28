import com.sheehan.jobdsl.CustomSecurityManager
import com.sheehan.jobdsl.ScriptExecutionModule
import com.sheehan.jobdsl.ScriptExecutor
import ratpack.form.Form
import ratpack.groovy.template.TextTemplateModule

import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack

System.securityManager = new CustomSecurityManager()

ratpack {

	bindings {
		module ScriptExecutionModule
		module TextTemplateModule, { TextTemplateModule.Config config -> config.staticallyCompile = true }
	}

	handlers {
        get {
            render groovyTemplate('index.html')
        }

		post("execute") { ScriptExecutor scriptExecutor ->
			parse(Form).then { Form form ->
				String script = form.script
				render scriptExecutor.execute(script)
			}
		}

        files {
            dir("static")
        }
	}

}


