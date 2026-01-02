"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is meditation really effective for reducing stress?",
    answer:
      "Yes, numerous scientific studies have shown that regular meditation practice can significantly reduce stress, anxiety, and depression. Even just 10 minutes a day can make a measurable difference in your mental wellbeing.",
  },
  {
    question: "Do I need any prior experience to start?",
    answer:
      "Not at all! Our app is designed for complete beginners. We offer guided sessions that walk you through every step, from basic breathing techniques to more advanced practices as you progress.",
  },
  {
    question: "How long are the meditation sessions?",
    answer:
      "We offer flexible session lengths from 5 to 60 minutes. Start with shorter sessions and gradually increase as you build your practice. Most of our users find 10-15 minute sessions perfect for daily practice.",
  },
  {
    question: "Can I use the app offline?",
    answer:
      "Yes! Premium members can download sessions for offline use, perfect for when you're traveling, in nature, or anywhere without internet connection.",
  },
  {
    question: "What makes your app different from other meditation apps?",
    answer:
      "We focus on personalization and simplicity. Our AI learns your preferences and suggests sessions that match your current mood and goals. Plus, our community features connect you with others on the same journey.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time with just one click. No hassles, no questions asked. Your access continues until the end of your current billing period.",
  },
]

export function FaqSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2">Questions & Answers</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about your meditation journey</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-base font-medium text-primary hover:text-primary/80">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
