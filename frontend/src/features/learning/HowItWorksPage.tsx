import { Link } from 'react-router'

const SECURITY_FLOW = [
    {
        sequence: '01',
        label: 'Attacker',
        title: 'A password candidate is sent',
        description:
            'The simulator chooses a password from the laboratory wordlist and sends a controlled login request.',
    },
    {
        sequence: '02',
        label: 'Authentication',
        title: 'The application checks the credentials',
        description:
            'HATCHLAB compares the supplied username and password with the local laboratory account.',
    },
    {
        sequence: '03',
        label: 'Defenses',
        title: 'Security controls inspect the behavior',
        description:
            'Enabled defenses examine request frequency, repeated failures, account state, and suspicious patterns.',
    },
    {
        sequence: '04',
        label: 'Outcome',
        title: 'The attempt receives a result',
        description:
            'The request may fail, succeed, be delayed, or be blocked. Every important result becomes a security event.',
    },
]

const DEFENSES = [
    {
        name: 'Rate Limiting',
        category: 'REQUEST CONTROL',
        trigger:
            'Too many login requests arrive inside a short time window.',
        effect:
            'Restricts how quickly additional attempts can reach authentication.',
    },
    {
        name: 'Progressive Delay',
        category: 'RESPONSE CONTROL',
        trigger:
            'The same account receives repeated invalid credentials.',
        effect:
            'Makes every new attempt take longer, reducing automated attack speed.',
    },
    {
        name: 'Account Lockout',
        category: 'IDENTITY CONTROL',
        trigger:
            'The account reaches the configured consecutive failure threshold.',
        effect:
            'Temporarily prevents additional authentication attempts against that account.',
    },
    {
        name: 'Client Throttling',
        category: 'CLIENT CONTROL',
        trigger:
            'One laboratory client repeatedly generates failed requests.',
        effect:
            'Slows or blocks the source producing abusive authentication traffic.',
    },
    {
        name: 'Suspicious Login Detection',
        category: 'DETECTION',
        trigger:
            'Authentication activity matches an abnormal repeated-failure pattern.',
        effect:
            'Creates a visible security signal so defenders can understand the behavior.',
    },
    {
        name: 'Security Event Logging',
        category: 'OBSERVABILITY',
        trigger:
            'An authentication, simulation, or defensive action occurs.',
        effect:
            'Records what happened so the complete attack story can be inspected later.',
    },
]

const GLOSSARY = [
    {
        term: 'Credential',
        meaning:
            'Information used to prove identity, normally a username and password.',
    },
    {
        term: 'Login attempt',
        meaning:
            'One request asking the application to authenticate a set of credentials.',
    },
    {
        term: 'Wordlist',
        meaning:
            'A controlled collection of password candidates used only inside HATCHLAB.',
    },
    {
        term: 'Baseline',
        meaning:
            'A simulation executed without preventive defenses, used as the comparison starting point.',
    },
    {
        term: 'Protected simulation',
        meaning:
            'An equivalent simulation executed with one or more defensive controls enabled.',
    },
    {
        term: 'Blocked attempt',
        meaning:
            'A request stopped by a defense before authentication could continue normally.',
    },
    {
        term: 'Security event',
        meaning:
            'A timestamped record explaining an authentication or defensive action.',
    },
    {
        term: 'Simulation session',
        meaning:
            'The complete record of one controlled attack execution and its results.',
    },
]

const RESULT_COLORS = [
    {
        tone: 'green',
        label: 'Protected or healthy',
        description:
            'A defense acted successfully, a service is online, or a safe operation completed.',
    },
    {
        tone: 'yellow',
        label: 'Attention or activity',
        description:
            'An attack is running, suspicious behavior was detected, or an action needs attention.',
    },
    {
        tone: 'red',
        label: 'Risk or failure',
        description:
            'Credentials succeeded, a request failed unexpectedly, or an important risk was found.',
    },
    {
        tone: 'blue',
        label: 'Information',
        description:
            'A neutral system action or event was recorded for context.',
    },
]

export function HowItWorksPage() {
    return (
        <main className="learning-page">
            <section className="learning-hero">
                <div className="learning-hero__content">
                    <span className="section-eyebrow">
                        START HERE
                    </span>

                    <h1>
                        Understand the attack.
                        <br />
                        Watch defenses respond.
                    </h1>

                    <p>
                        HATCHLAB is a safe local laboratory that
                        demonstrates how repeated password attacks
                        behave, how defensive controls react, and
                        how security teams interpret the resulting
                        evidence.
                    </p>

                    <div className="learning-hero__actions">
                        <Link
                            className="button button--primary"
                            to="/attack"
                        >
                            Try a guided scenario
                        </Link>

                        <a
                            className="button button--secondary"
                            href="#security-story"
                        >
                            Follow the security story
                        </a>
                    </div>
                </div>

                <aside className="learning-hero__safety">
                    <span>SAFE BY DESIGN</span>

                    <strong>
                        Local laboratory only
                    </strong>

                    <p>
                        HATCHLAB does not target external
                        applications. Simulations run only against
                        its own controlled authentication
                        environment.
                    </p>

                    <dl>
                        <div>
                            <dt>Target</dt>
                            <dd>Local auth lab</dd>
                        </div>

                        <div>
                            <dt>Environment</dt>
                            <dd>Localhost</dd>
                        </div>

                        <div>
                            <dt>Purpose</dt>
                            <dd>Education</dd>
                        </div>
                    </dl>
                </aside>
            </section>

            <section
                className="learning-section"
                id="security-story"
            >
                <header className="learning-section__header">
                    <div>
                        <span className="panel-eyebrow">
                            THE SECURITY STORY
                        </span>

                        <h2>
                            One login attempt, four understandable
                            steps
                        </h2>
                    </div>

                    <p>
                        Every simulated password guess follows the
                        same path. HATCHLAB exposes that path so you
                        can see exactly where defenses intervene.
                    </p>
                </header>

                <div className="learning-flow">
                    {SECURITY_FLOW.map(
                        (step, index) => (
                            <article
                                className="learning-flow__step"
                                key={step.sequence}
                            >
                                <div className="learning-flow__heading">
                                    <span>
                                        {step.sequence}
                                    </span>

                                    <small>
                                        {step.label}
                                    </small>
                                </div>

                                <strong>
                                    {step.title}
                                </strong>

                                <p>
                                    {step.description}
                                </p>

                                {index <
                                    SECURITY_FLOW.length -
                                    1 && (
                                        <span
                                            className="learning-flow__arrow"
                                            aria-hidden="true"
                                        >
                                        →
                                    </span>
                                    )}
                            </article>
                        ),
                    )}
                </div>
            </section>

            <section className="learning-explanation">
                <article className="learning-explanation__attack">
                    <span className="panel-eyebrow">
                        WHAT IS THE ATTACK?
                    </span>

                    <h2>
                        Repeated credential guessing
                    </h2>

                    <p>
                        An automated attacker can submit many
                        username and password combinations until
                        one works. A single failed login is normal;
                        a rapid sequence of failures may indicate
                        abuse.
                    </p>

                    <div className="learning-example">
                        <span>SIMPLIFIED EXAMPLE</span>

                        <ol>
                            <li>
                                Try password candidate number one.
                            </li>
                            <li>
                                Receive an invalid-credentials
                                response.
                            </li>
                            <li>
                                Immediately try another candidate.
                            </li>
                            <li>
                                Continue until credentials succeed
                                or a defense stops the process.
                            </li>
                        </ol>
                    </div>
                </article>

                <article className="learning-explanation__reading">
                    <span className="panel-eyebrow">
                        HOW TO READ THE RESULT
                    </span>

                    <h2>
                        The important questions
                    </h2>

                    <ul>
                        <li>
                            <span>01</span>
                            <p>
                                Did the simulated attacker discover
                                valid credentials?
                            </p>
                        </li>

                        <li>
                            <span>02</span>
                            <p>
                                How many password guesses were
                                processed?
                            </p>
                        </li>

                        <li>
                            <span>03</span>
                            <p>
                                Did a defense interrupt or slow the
                                attack?
                            </p>
                        </li>

                        <li>
                            <span>04</span>
                            <p>
                                Which control was responsible for
                                the outcome?
                            </p>
                        </li>
                    </ul>
                </article>
            </section>

            <section className="learning-section">
                <header className="learning-section__header">
                    <div>
                        <span className="panel-eyebrow">
                            DEFENSIVE CONTROLS
                        </span>

                        <h2>
                            Six controls, six different jobs
                        </h2>
                    </div>

                    <p>
                        Security is strongest when multiple
                        controls detect, delay, block, and record
                        the same attack.
                    </p>
                </header>

                <div className="learning-defense-grid">
                    {DEFENSES.map((defense, index) => (
                        <article
                            className="learning-defense"
                            key={defense.name}
                        >
                            <div>
                                <span>
                                    {String(index + 1).padStart(
                                        2,
                                        '0',
                                    )}
                                </span>

                                <small>
                                    {defense.category}
                                </small>
                            </div>

                            <h3>{defense.name}</h3>

                            <dl>
                                <div>
                                    <dt>When it reacts</dt>
                                    <dd>
                                        {defense.trigger}
                                    </dd>
                                </div>

                                <div>
                                    <dt>What it changes</dt>
                                    <dd>
                                        {defense.effect}
                                    </dd>
                                </div>
                            </dl>
                        </article>
                    ))}
                </div>
            </section>

            <section className="learning-section">
                <header className="learning-section__header">
                    <div>
                        <span className="panel-eyebrow">
                            VISUAL LANGUAGE
                        </span>

                        <h2>
                            What the interface colors mean
                        </h2>
                    </div>
                </header>

                <div className="learning-colors">
                    {RESULT_COLORS.map((color) => (
                        <article
                            className={`learning-color learning-color--${color.tone}`}
                            key={color.tone}
                        >
                            <span aria-hidden="true" />

                            <strong>
                                {color.label}
                            </strong>

                            <p>
                                {color.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="learning-section">
                <header className="learning-section__header">
                    <div>
                        <span className="panel-eyebrow">
                            QUICK GLOSSARY
                        </span>

                        <h2>
                            Security language without the jargon
                        </h2>
                    </div>
                </header>

                <div className="learning-glossary">
                    {GLOSSARY.map((item) => (
                        <article key={item.term}>
                            <strong>{item.term}</strong>
                            <p>{item.meaning}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="learning-next-step">
                <div>
                    <span className="section-eyebrow">
                        YOUR FIRST EXPERIMENT
                    </span>

                    <h2>
                        Compare an open login with a protected one
                    </h2>

                    <p>
                        Start with the Unprotected scenario. Then
                        repeat the experiment using Account
                        Lockout or Full Protection and observe how
                        the outcome changes.
                    </p>
                </div>

                <ol>
                    <li>
                        <span>1</span>
                        Choose a guided scenario.
                    </li>

                    <li>
                        <span>2</span>
                        Prepare and start the simulation.
                    </li>

                    <li>
                        <span>3</span>
                        Read the live explanation and final result.
                    </li>
                </ol>

                <Link
                    className="button button--primary"
                    to="/attack"
                >
                    Start the guided experiment
                </Link>
            </section>
        </main>
    )
}