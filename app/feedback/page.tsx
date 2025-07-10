"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bug, Lightbulb, Heart, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", {
      type: feedbackType,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    setIsSubmitted(true)
    setIsSubmitting(false)

    toast({
      title: "Takk for tilbakemeldingen!",
      description: "Vi setter stor pris på din feedback og vil se på den så snart som mulig.",
    })
  }

  const feedbackTypes = [
    { value: "bug", label: "Feilrapport", icon: Bug, color: "bg-red-100 text-red-800" },
    { value: "feature", label: "Funksjonsforslag", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
    { value: "general", label: "Generell tilbakemelding", icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
    { value: "praise", label: "Ros og anerkjennelse", icon: Heart, color: "bg-green-100 text-green-800" },
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Takk for din tilbakemelding! 🙏</h1>
                <p className="text-gray-600 mb-6">
                  Vi har mottatt din melding og vil se på den så snart som mulig. Din feedback hjelper oss å gjøre
                  Skjærgårdshelt enda bedre!
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setFeedbackType("")
                  setEmail("")
                  setSubject("")
                  setMessage("")
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Send ny tilbakemelding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Din mening betyr alt for oss! 💬</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Som beta-bruker er din tilbakemelding uvurderlig. Hjelp oss å gjøre Skjærgårdshelt til den beste appen for
            kystrenhold og miljøengasjement.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Feedback Types Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Hva kan du gi tilbakemelding på?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div key={type.value} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <Badge className={type.color}>{type.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Hvorfor er din feedback viktig?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  🎯 <strong>Forbedrer brukeropplevelsen</strong> - Din erfaring hjelper oss å lage en bedre app
                </p>
                <p>
                  🐛 <strong>Finner og fikser feil</strong> - Du oppdager ting vi kanskje ikke ser
                </p>
                <p>
                  💡 <strong>Inspirerer nye funksjoner</strong> - Dine ideer former fremtiden til appen
                </p>
                <p>
                  🌊 <strong>Styrker miljøarbeidet</strong> - Sammen gjør vi kystene renere
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Send din tilbakemelding</CardTitle>
                <CardDescription>
                  Alle felt er valgfrie, men jo mer informasjon du gir, desto bedre kan vi hjelpe deg.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback-type">Type tilbakemelding</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type tilbakemelding..." />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => {
                          const Icon = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post (valgfri)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@epost.no"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Vi bruker kun e-posten din for å følge opp tilbakemeldingen hvis nødvendig.
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Emne</Label>
                    <Input
                      id="subject"
                      placeholder="Kort beskrivelse av tilbakemeldingen..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Melding</Label>
                    <Textarea
                      id="message"
                      placeholder="Fortell oss mer om din opplevelse, forslag til forbedringer, eller rapporter feil..."
                      className="min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sender...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send tilbakemelding
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-8">
          <CardContent className="p-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Personvern:</strong> Vi behandler all tilbakemelding konfidensielt og i henhold til GDPR.
              </p>
              <p>
                <strong>Responstid:</strong> Vi svarer vanligvis innen 2-3 virkedager på tilbakemeldinger som krever
                oppfølging.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
