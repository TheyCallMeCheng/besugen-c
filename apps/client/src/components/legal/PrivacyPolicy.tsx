interface PrivacyPolicyProps {
    onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>&larr;</span>
                        <span>Back</span>
                    </button>
                )}

                <div className="bg-slate-800/80 rounded-2xl p-8 shadow-2xl border border-slate-700">
                    <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-slate-400 mb-8">Last updated: February 1, 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to Besugen ("we," "our," or "us"). This Privacy Policy explains how we collect,
                                use, disclose, and safeguard your information when you use our Discord Activity game
                                ("the Service"). We are committed to protecting your privacy and complying with the
                                General Data Protection Regulation (GDPR) and other applicable data protection laws.
                            </p>
                            <p>
                                By using our Service, you consent to the data practices described in this policy.
                                If you do not agree with this policy, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Data Controller</h2>
                            <p>
                                For the purposes of GDPR, we act as the Data Controller for the personal data we collect.
                                If you have questions about our data practices, please contact us at the details provided
                                at the end of this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Information We Collect</h2>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">3.1 Discord Account Information</h3>
                            <p>When you use our Service through Discord, we receive and process:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Your Discord User ID (unique identifier)</li>
                                <li>Your Discord username and display name</li>
                                <li>Your Discord avatar URL</li>
                            </ul>
                            <p className="mt-2">
                                This information is provided by Discord through their OAuth authentication system and is
                                necessary for the game to function within Discord Activities.
                            </p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">3.2 Game Usage Data</h3>
                            <p>We collect analytics data about how you use the Service, including:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Game sessions (when you create or join rooms)</li>
                                <li>Game events (game starts, game completions, rounds played)</li>
                                <li>Page/screen views within the application</li>
                                <li>Tutorial interactions</li>
                                <li>General interaction patterns (clicks, navigation)</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">3.3 Technical Data</h3>
                            <p>We automatically collect certain technical information:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Device type and browser information</li>
                                <li>Error logs and crash reports</li>
                                <li>Session duration and timestamps</li>
                                <li>IP address (anonymized)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Legal Basis for Processing (GDPR)</h2>
                            <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong className="text-white">Contract Performance:</strong> Processing Discord account
                                    data is necessary to provide the game service you requested.
                                </li>
                                <li>
                                    <strong className="text-white">Legitimate Interests:</strong> We process usage analytics
                                    to improve our Service, fix bugs, and understand how users interact with the game.
                                    This processing is balanced against your privacy rights.
                                </li>
                                <li>
                                    <strong className="text-white">Consent:</strong> Where required by law, we obtain your
                                    consent before processing certain data.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. How We Use Your Information</h2>
                            <p>We use the collected information to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Provide, operate, and maintain the game service</li>
                                <li>Identify you in multiplayer game sessions</li>
                                <li>Display your name and avatar to other players</li>
                                <li>Analyze usage patterns to improve game features</li>
                                <li>Diagnose technical issues and fix bugs</li>
                                <li>Ensure fair play and prevent abuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">6.1 PostHog Analytics</h3>
                            <p>
                                We use PostHog, a product analytics platform, to collect and analyze usage data. PostHog
                                processes data on our behalf as a Data Processor. PostHog may store data on servers located
                                in the United States or European Union, with appropriate safeguards in place.
                            </p>
                            <p className="mt-2">
                                PostHog's privacy policy can be found at:{' '}
                                <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer"
                                   className="text-green-400 hover:text-green-300 underline">
                                    https://posthog.com/privacy
                                </a>
                            </p>

                            <h3 className="text-lg font-medium text-white mt-4 mb-2">6.2 Discord</h3>
                            <p>
                                Our Service operates within Discord's platform. Discord's privacy policy governs their
                                collection and use of your data. You can review Discord's privacy policy at:{' '}
                                <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer"
                                   className="text-green-400 hover:text-green-300 underline">
                                    https://discord.com/privacy
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention</h2>
                            <p>
                                We retain your personal data only for as long as necessary to fulfill the purposes outlined
                                in this policy:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Analytics data is retained for up to 12 months</li>
                                <li>Game session data is deleted when the session ends</li>
                                <li>User identifiers may be retained for up to 24 months for service improvement</li>
                            </ul>
                            <p className="mt-2">
                                You may request earlier deletion of your data by contacting us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights (GDPR)</h2>
                            <p>Under GDPR, you have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong className="text-white">Right of Access:</strong> Request a copy of the personal
                                    data we hold about you.
                                </li>
                                <li>
                                    <strong className="text-white">Right to Rectification:</strong> Request correction of
                                    inaccurate personal data.
                                </li>
                                <li>
                                    <strong className="text-white">Right to Erasure:</strong> Request deletion of your
                                    personal data ("right to be forgotten").
                                </li>
                                <li>
                                    <strong className="text-white">Right to Restrict Processing:</strong> Request limitation
                                    of how we process your data.
                                </li>
                                <li>
                                    <strong className="text-white">Right to Data Portability:</strong> Receive your data in
                                    a structured, machine-readable format.
                                </li>
                                <li>
                                    <strong className="text-white">Right to Object:</strong> Object to processing based on
                                    legitimate interests.
                                </li>
                                <li>
                                    <strong className="text-white">Right to Withdraw Consent:</strong> Where processing is
                                    based on consent, withdraw it at any time.
                                </li>
                            </ul>
                            <p className="mt-2">
                                To exercise these rights, please contact us using the details below. We will respond within
                                one month as required by GDPR.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. International Data Transfers</h2>
                            <p>
                                Your data may be transferred to and processed in countries outside the European Economic
                                Area (EEA). When this occurs, we ensure appropriate safeguards are in place, such as:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Standard Contractual Clauses approved by the European Commission</li>
                                <li>Adequacy decisions for countries with equivalent data protection</li>
                                <li>Binding Corporate Rules where applicable</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal
                                data against unauthorized access, alteration, disclosure, or destruction. However, no
                                method of transmission over the Internet is 100% secure, and we cannot guarantee absolute
                                security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. Children's Privacy</h2>
                            <p>
                                Our Service is intended for users aged 13 and older, in accordance with Discord's Terms of
                                Service. We do not knowingly collect personal data from children under 13. If you believe
                                a child under 13 has provided us with personal data, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any material
                                changes by updating the "Last updated" date at the top of this policy. Your continued use
                                of the Service after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, wish to exercise your data rights, or
                                have concerns about our data practices, please contact us:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Email: privacy@besugen.com</li>
                                <li>Discord Support Server: https://discord.gg/bdSWdrc6vG</li>
                            </ul>
                            <p className="mt-2">
                                You also have the right to lodge a complaint with your local data protection supervisory
                                authority if you believe we have not adequately addressed your concerns.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
