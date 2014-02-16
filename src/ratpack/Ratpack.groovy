import com.sheehan.jobdsl.CustomSecurityManager
import com.sheehan.jobdsl.ScriptExecutionModule
import com.sheehan.jobdsl.ScriptExecutor
import ratpack.form.Form
import ratpack.groovy.templating.TemplatingModule

import static ratpack.form.Forms.form
import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack

ratpack {

    modules {
        register new ScriptExecutionModule()
        get(TemplatingModule).staticallyCompile = true

        init {
            System.securityManager = new CustomSecurityManager()
        }
    }

    handlers {
        get {
            render groovyTemplate("index.html", title: "Job DSL")
        }

        post("execute") { ScriptExecutor scriptExecutor ->
            Form form = parse form()
            String script = form.script
            render scriptExecutor.execute(script)
        }

        assets "public"
    }

}


