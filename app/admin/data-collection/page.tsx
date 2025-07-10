"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Download, MapPin, Users, Weight, Calendar } from "lucide-react"

interface ReportData {
  id: string
  location_name: string
  cleanup_date: string
  total_weight_kg: number
  volunteer_count: number
  waste_categories: any[]
  status: string
  created_at: string
}

interface LocationData {
  location_name: string
  total_cleanups: number
  total_weight_kg: number
  total_volunteers: number
}

interface ActivityData {
  activity_type: string
  count: number
}

export default function DataCollectionDashboard() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("official_reports_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (reportsError) throw reportsError
      setReports(reportsData || [])

      // Load location intelligence
      const { data: locationsData, error: locationsError } = await supabase
        .from("location_intelligence")
        .select("*")
        .order("total_weight_kg", { ascending: false })
        .limit(20)

      if (locationsError) throw locationsError
      setLocations(locationsData || [])

      // Load activity summary
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("user_activity_log")
        .select("activity_type")

      if (activitiesError) throw activitiesError

      // Group activities by type
      const activityCounts = (activitiesData || []).reduce((acc: Record<string, number>, item) => {
        acc[item.activity_type] = (acc[item.activity_type] || 0) + 1
        return acc
      }, {})

      setActivities(
        Object.entries(activityCounts).map(([type, count]) => ({
          activity_type: type,
          count: count as number,
        })),
      )
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReportsData = async () => {
    try {
      const { data, error } = await supabase.from("official_reports_queue").select("*").csv()

      if (error) throw error

      // Create and download CSV file
      const blob = new Blob([data], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cleanup_reports_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laster data...</p>
      </div>
    )
  }

  const totalReports = reports.length
  const totalWeight = reports.reduce((sum, report) => sum + (report.total_weight_kg || 0), 0)
  const totalVolunteers = reports.reduce((sum, report) => sum + (report.volunteer_count || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-8 w-8" />
              Data Collection Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive data collection for future API integration</p>
          </div>
          <Button onClick={exportReportsData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWeight.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVolunteers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Cleanup Reports</TabsTrigger>
            <TabsTrigger value="locations">Location Intelligence</TabsTrigger>
            <TabsTrigger value="activities">User Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Recent Cleanup Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{report.location_name || "Unknown Location"}</span>
                            <Badge variant={report.status === "pending" ? "secondary" : "default"}>
                              {report.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Weight className="h-3 w-3" />
                              {report.total_weight_kg || 0} kg
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {report.volunteer_count || 1} volunteers
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.cleanup_date).toLocaleDateString("no-NO")}
                            </span>
                          </div>
                          {report.waste_categories && report.waste_categories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {report.waste_categories.slice(0, 3).map((category: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {category.type}
                                </Badge>
                              ))}
                              {report.waste_categories.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.waste_categories.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString("no-NO")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Location Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{location.location_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{location.total_cleanups} cleanups</span>
                            <span>{location.total_weight_kg} kg total</span>
                            <span>{location.total_volunteers} volunteers</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {(location.total_weight_kg / location.total_cleanups).toFixed(1)} kg
                          </div>
                          <div className="text-xs text-gray-500">avg per cleanup</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activities.map((activity) => (
                    <div key={activity.activity_type} className="border rounded-lg p-3">
                      <div className="text-lg font-bold">{activity.count}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {activity.activity_type.replace(/_/g, " ")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
