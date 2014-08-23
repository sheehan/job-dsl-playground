import com.sheehan.jobdsl.CustomSecurityManager
import com.sheehan.jobdsl.GistService
import com.sheehan.jobdsl.ScriptExecutionModule
import com.sheehan.jobdsl.ScriptExecutor
import groovy.json.JsonBuilder
import ratpack.form.Form

import static ratpack.groovy.Groovy.groovyTemplate
import static ratpack.groovy.Groovy.ratpack

ratpack {

    bindings {
        add new ScriptExecutionModule()

        init {
            System.securityManager = new CustomSecurityManager()
        }
    }

    handlers {
        get {
            render groovyTemplate('index.html')
        }

        get('gist/:id') { GistService gistService ->
            String input = gistService.getGroovyText(pathTokens.id)

            Map jsonData = [input: input]
            render groovyTemplate('index.html',
                id: pathTokens.id,
                json: new JsonBuilder(jsonData).toString()
            )
        }

        post('execute') { ScriptExecutor scriptExecutor ->
            Form form = parse(Form)
            String script = form.script
            render scriptExecutor.execute(script)
        }

        assets 'public'
    }

}


