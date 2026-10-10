package com.meghlove

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var currentLine = 0

    private val pickupLines = listOf(
        "❤️ Are you a magician? Because every time I look at you, everyone else disappears ✨",
        "🌹 If beauty were a crime, you'd be serving a life sentence 💕",
        "⭐ If I could rearrange the alphabet, I'd put U and I together 💗",
        "🌙 You must be the moon, because even in darkness, you light up my world 🌟",
        "💖 I'm not a photographer, but I can definitely picture us together 📸",
        "🦋 If you were a flower, you'd be a rose — beautiful but with thorns to protect your heart 🌹",
        "🎵 Are you WiFi? Because I'm feeling a strong connection between us 💕",
        "🌈 They say nothing lasts forever — will you be my nothing? 🥹",
        "💫 If kisses were stars, I'd give you the entire night sky 🌌",
        "❤️ You're the only person I'd share my last piece of cake with — and that says a lot 🍰",
        "🔥 If you were a drop of water, you'd still be the most beautiful ocean I've ever seen 🌊",
        "💎 Are you a diamond? Because you're precious, rare, and unbreakable 💪",
        "🌻 Even the sun gets jealous of how bright your smile is 😊",
        "🧭 I must be lost — because I see heaven in your eyes 👼",
        "💝 If loving you was a job, I'd be the richest person alive 💰❤️",
        "🌺 You're not just my crush — you're my entire world 🌍",
        "⚡ My phone lights up when your name appears — but my heart lights up when you're near 💕",
        "🎯 Cupid must have perfect aim — because he hit my heart with you 💘",
        "🌹 A rose for a rose — but you're more beautiful than any flower 🥀",
        "❤️ I don't believe in love at first sight — until I saw you 👀💫",
        "🧸 I want to be the reason you smile before you sleep and the first thought when you wake 🌅",
        "🍯 You're sweeter than honey and warmer than the sun — how did I get so lucky? ☀️",
        "🕊️ If I could give you one thing in life, I'd give you the ability to see yourself through my eyes 💗",
        "🌸 In a world full of trends, you remain a classic — timeless and beautiful 🌹",
        "🎶 Your laugh is my favorite song — put it on repeat forever 🎧❤️",
    )

    private lateinit var pickupLineText: TextView
    private lateinit var lineCounter: TextView
    private lateinit var nextBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        pickupLineText = findViewById(R.id.pickupLineText)
        lineCounter = findViewById(R.id.lineCounter)
        nextBtn = findViewById(R.id.nextBtn)

        showLine()

        nextBtn.setOnClickListener {
            currentLine = (currentLine + 1) % pickupLines.size
            showLine()
        }
    }

    private fun showLine() {
        pickupLineText.alpha = 0f
        pickupLineText.text = pickupLines[currentLine]
        pickupLineText.animate().alpha(1f).setDuration(600).start()
        lineCounter.text = "${currentLine + 1} / ${pickupLines.size}"
    }
}
