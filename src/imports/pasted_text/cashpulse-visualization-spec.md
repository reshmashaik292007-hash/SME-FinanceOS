FIX THE CASHPULSE VISUALIZATION — MAKE THE HIGHS AND LOWS VERY CLEAR.

The current pulse is too flat and subtle.

I want a visually obvious financial pulse with CLEAR HIGH POINTS and LOW POINTS.

The viewer should immediately see:

HIGH → LOW → HIGH → LOW → HIGH

It should feel alive and dynamic.

==================================================
DESIRED PULSE SHAPE
==================================================

Create a strong repeating pulse waveform similar to:

          HIGH                         HIGH
           ╱╲                          ╱╲
          ╱  ╲                        ╱  ╲
─────────╯    ╰───────╮       ╭──────╯    ╰────────
                      ╲     ╱
                       ╲___╱
                       LOW

Then:

                    HIGH
                     ╱╲
                    ╱  ╲
────────╮          ╱    ╰────────╮
        ╰──────────╯              ╰────
             LOW

The waveform must clearly have:

HIGH PEAK
↓
LOW VALLEY
↓
BASELINE
↓
HIGH PEAK
↓
LOW VALLEY
↓
BASELINE

==================================================
IMPORTANT
==================================================

Do NOT create a smooth stock-market line.

Do NOT create a flat waveform.

Do NOT create tiny variations that are difficult to see.

Do NOT create identical ECG spikes.

The highs and lows should be visually obvious.

==================================================
AMPLITUDE
==================================================

Increase the vertical amplitude significantly.

The difference between HIGH and LOW should be approximately 60–70% of the available pulse area.

Example:

        HIGH
          ▲
          │
          │       ╭──╮
          │      ╱    ╲
BASELINE ─┼─────╯      ╰──────────╮
          │                        ╲
          │                         ╲
          │                          ╰──╮
          │                             ╰
          ▼
         LOW

The waveform should use most of the available vertical space.

==================================================
PULSE RHYTHM
==================================================

Each cycle should have:

1. calm baseline
2. small rise
3. strong HIGH peak
4. sharp but smooth fall
5. clear LOW valley
6. recovery to baseline
7. calm section
8. next HIGH peak

Repeat across the card.

But vary the peaks slightly.

For example:

HIGH 1 = 85%
LOW 1 = 35%

HIGH 2 = 65%
LOW 2 = 25%

HIGH 3 = 90%
LOW 3 = 40%

HIGH 4 = 72%
LOW 4 = 20%

This makes the pulse feel dynamic rather than mechanically repeated.

==================================================
VISUAL EXAMPLE
==================================================

The final waveform should approximately communicate:

                 /\                    /\
                /  \                  /  \
───────────────/    \───────╮────────/    \────────
                            │
                            │
                            ╰────╮
                                 ╰──────
                                    LOW

                       /\ 
                      /  \
──────────────╮──────/    \──────────────
              ╰────╯
                LOW

Make the HIGH and LOW visually unmistakable.

==================================================
ANIMATION
==================================================

Animate the waveform continuously from LEFT to RIGHT.

Add a small glowing dot at the current position.

The dot should move along the waveform.

When the dot reaches a HIGH:
slightly brighten it.

When the dot reaches a LOW:
slightly dim it.

Keep the animation smooth.

==================================================
FINANCIAL MEANING
==================================================

The waveform represents financial momentum.

HIGH areas represent:
healthy financial momentum

LOW areas represent:
financial pressure / weaker momentum

Do not label every peak.

Do not put HIGH and LOW text on the chart.

The SHAPE itself should communicate it.

==================================================
SCORE REACTIVITY
==================================================

CashPulse score controls the waveform.

For 80–100:

Higher confident peaks
Cleaner recovery
Stable rhythm

For 60–79:

Moderate highs and lows
Slightly more variation

For 40–59:

Deeper lows
Less consistent peaks

For 0–39:

Very deep lows
Irregular peaks
More unstable rhythm

The difference must be VISUALLY OBVIOUS.

==================================================
DESIGN
==================================================

Keep the overall premium dark fintech design.

Background:
dark navy

Pulse:
emerald/cyan

Glow:
subtle

No heavy grid.

No X-axis.

No Y-axis.

No chart labels.

No stock-chart UI.

No hospital ECG UI.

==================================================
CARD
==================================================

Use:

YOUR BUSINESS PULSE

78 / 100

HEALTHY

"Your finances are stable."

Then a large pulse visualization.

The pulse should occupy approximately 50–60% of the card height.

Make the waveform wide.

Give it enough vertical room for obvious highs and lows.

==================================================
SVG IMPLEMENTATION
==================================================

Use a custom SVG.

Do NOT use a generic Recharts LineChart.

Create an SVG path manually.

Use:

stroke-width: 3–4px

with smooth curves.

Use SVG animation / CSS transform for continuous horizontal movement.

The path must have clearly defined peaks and valleys.

Avoid a perfectly sinusoidal wave.

Use a custom pulse pattern.

==================================================
MOST IMPORTANT TEST
==================================================

When I look at the visualization from a distance, I should immediately see:

HIGH
LOW
HIGH
LOW
HIGH
LOW

If I have to look closely to find the highs and lows,
the amplitude is too small.

Increase the amplitude.

If it looks like a hospital ECG,
make the curves softer and vary the peaks.

The final visualization should be:

OBVIOUSLY A PULSE
+
CLEAR HIGH/LOW MOVEMENT
+
PREMIUM FINTECH DESIGN
+
SMOOTH ANIMATION

Do not make it subtle.

Make the highs and lows clearly visible.