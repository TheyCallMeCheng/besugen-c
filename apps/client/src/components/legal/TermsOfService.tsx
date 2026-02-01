interface TermsOfServiceProps {
    onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
                    <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-slate-400 mb-8">Last updated: February 1, 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using Besugen ("the Service"), a multiplayer card game available as a
                                Discord Activity, you agree to be bound by these Terms of Service ("Terms"). If you
                                disagree with any part of these Terms, you may not access the Service.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you and Besugen ("we," "us,"
                                or "our"). Please read them carefully before using the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                            <p>
                                Besugen is a multiplayer card game designed to be played within Discord as an Activity.
                                The Service allows users to:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Create and join game rooms with friends</li>
                                <li>Play multiplayer card games in real-time</li>
                                <li>Interact with other Discord users within game sessions</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
                            <p>
                                To use the Service, you must:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Be at least 13 years of age</li>
                                <li>Have a valid Discord account in good standing</li>
                                <li>Comply with Discord's Terms of Service and Community Guidelines</li>
                                <li>Not be prohibited from using the Service under applicable laws</li>
                            </ul>
                            <p className="mt-2">
                                If you are under 18, you confirm that you have obtained parental or guardian consent
                                to use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. User Conduct</h2>
                            <p>When using the Service, you agree NOT to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                                <li>Harass, abuse, threaten, or intimidate other users</li>
                                <li>Use offensive, vulgar, or inappropriate usernames or content</li>
                                <li>Attempt to cheat, exploit bugs, or use unauthorized modifications</li>
                                <li>Interfere with or disrupt the Service or servers</li>
                                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                                <li>Use automated scripts, bots, or tools to interact with the Service</li>
                                <li>Impersonate other users or entities</li>
                                <li>Share or distribute any part of the Service without permission</li>
                                <li>Reverse engineer, decompile, or disassemble the Service</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                            <p>
                                The Service and its original content, features, and functionality are owned by Besugen
                                and are protected by international copyright, trademark, patent, trade secret, and
                                other intellectual property laws.
                            </p>
                            <p className="mt-2">
                                You are granted a limited, non-exclusive, non-transferable license to access and use
                                the Service for personal, non-commercial purposes only. This license does not include:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Any resale or commercial use of the Service</li>
                                <li>Collection or use of any content for purposes other than playing the game</li>
                                <li>Any derivative use of the Service or its contents</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>
                            <p>
                                The Service operates within Discord's platform and relies on Discord's infrastructure.
                                Your use of Discord is subject to Discord's Terms of Service and Privacy Policy. We
                                are not responsible for Discord's actions, policies, or any changes to their platform.
                            </p>
                            <p className="mt-2">
                                We may use third-party services (such as analytics providers) to operate and improve
                                the Service. These services operate under their own terms and privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Privacy</h2>
                            <p>
                                Your use of the Service is also governed by our Privacy Policy, which describes how
                                we collect, use, and protect your personal information. By using the Service, you
                                consent to the data practices described in our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
                            <p>
                                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Warranties of merchantability or fitness for a particular purpose</li>
                                <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
                                <li>Warranties regarding the accuracy or reliability of information</li>
                            </ul>
                            <p className="mt-2">
                                We do not guarantee that the Service will be available at all times or that defects
                                will be corrected. You use the Service at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BESUGEN AND ITS AFFILIATES,
                                OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Any loss of profits, data, use, goodwill, or other intangible losses</li>
                                <li>Any damages resulting from unauthorized access to or use of our servers</li>
                                <li>Any damages resulting from interruption or cessation of the Service</li>
                            </ul>
                            <p className="mt-2">
                                In no event shall our total liability exceed the amount you paid us in the twelve (12)
                                months preceding the claim, or $100 USD, whichever is greater.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
                            <p>
                                You agree to defend, indemnify, and hold harmless Besugen and its affiliates from and
                                against any claims, damages, obligations, losses, liabilities, costs, or expenses
                                arising from:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Your use of the Service</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Your violation of any applicable laws</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your access to the Service at any time,
                                without prior notice or liability, for any reason, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Violation of these Terms</li>
                                <li>Conduct that we determine is harmful to other users or the Service</li>
                                <li>At our sole discretion for any other reason</li>
                            </ul>
                            <p className="mt-2">
                                Upon termination, your right to use the Service will immediately cease. Provisions of
                                these Terms that by their nature should survive termination shall survive.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">12. Modifications to Service</h2>
                            <p>
                                We reserve the right to modify, suspend, or discontinue the Service (or any part
                                thereof) at any time, with or without notice. We shall not be liable to you or any
                                third party for any modification, suspension, or discontinuation of the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">13. Changes to Terms</h2>
                            <p>
                                We may revise these Terms from time to time. Material changes will be notified by
                                updating the "Last updated" date at the top. Your continued use of the Service after
                                any changes constitutes acceptance of the new Terms.
                            </p>
                            <p className="mt-2">
                                We encourage you to review these Terms periodically to stay informed of updates.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">14. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with applicable laws,
                                without regard to conflict of law principles. Any disputes arising from these Terms
                                or the Service shall be resolved through good-faith negotiation, and if unsuccessful,
                                through binding arbitration or courts of competent jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">15. Severability</h2>
                            <p>
                                If any provision of these Terms is found to be unenforceable or invalid, that provision
                                shall be modified to the minimum extent necessary to make it enforceable, or if
                                modification is not possible, severed from these Terms. The remaining provisions shall
                                continue in full force and effect.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">16. Entire Agreement</h2>
                            <p>
                                These Terms, together with our Privacy Policy, constitute the entire agreement between
                                you and Besugen regarding the Service and supersede any prior agreements or
                                communications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">17. Contact Us</h2>
                            <p>
                                If you have questions about these Terms of Service, please contact us:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Email: legal@besugen.com</li>
                                <li>Discord Support Server: https://discord.gg/bdSWdrc6vG</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
