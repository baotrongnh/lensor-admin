"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from '@/components/ui/dialog'
import { SettingsService } from '@/services/settings.service'
import { toast } from 'sonner'
import { Settings2, Percent, Save, AlertCircle, Info, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
     const [discountRate, setDiscountRate] = useState<string>('')
     const [inputValue, setInputValue] = useState<string>('')
     const [loading, setLoading] = useState(true)
     const [updating, setUpdating] = useState(false)
     const [hasChanges, setHasChanges] = useState(false)
     const [showConfirmDialog, setShowConfirmDialog] = useState(false)

     useEffect(() => {
          fetchDiscountRate()
     }, [])

     useEffect(() => {
          setHasChanges(inputValue !== discountRate && inputValue !== '')
     }, [inputValue, discountRate])

     /**
      * Fetch current discount rate from API
      */
     const fetchDiscountRate = async () => {
          try {
               setLoading(true)
               const response = await SettingsService.getDiscountRate()

               console.log(response.data);
               if (response.data) {
                    const value = response.data.discountRate
                    setDiscountRate(value)
                    setInputValue(value)
               }
          } catch (error) {
               console.error('Error fetching discount rate:', error)
               toast.error('Failed to load discount rate')
          } finally {
               setLoading(false)
          }
     }

     /**
      * Show confirmation dialog before updating
      */
     const handleSaveClick = () => {
          // Validation
          const numValue = parseFloat(inputValue)
          if (isNaN(numValue)) {
               toast.error('Please enter a valid number')
               return
          }

          if (numValue < 0 || numValue > 100) {
               toast.error('Discount rate must be between 0 and 100')
               return
          }

          // Show confirmation dialog
          setShowConfirmDialog(true)
     }

     /**
      * Update discount rate after confirmation
      */
     const handleConfirmUpdate = async () => {
          try {
               setUpdating(true)
               const response = await SettingsService.updateDiscountRate(inputValue)

               if (response.data && response.data.discountRate) {
                    // Update state directly from API response
                    const newRate = response.data.discountRate
                    setDiscountRate(newRate)
                    setInputValue(newRate)
                    setHasChanges(false)

                    // Close dialog
                    setShowConfirmDialog(false)

                    // Show success message
                    toast.success(`Discount rate updated to ${newRate}% successfully`)
               }
          } catch (error) {
               console.error('Error updating discount rate:', error)
               const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
               toast.error(message || 'Failed to update discount rate')
          } finally {
               setUpdating(false)
          }
     }

     /**
      * Reset input to current value
      */
     const handleReset = () => {
          setInputValue(discountRate)
          setHasChanges(false)
     }

     /**
      * Handle input change with validation
      */
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value
          // Only allow numbers and decimal point
          if (value === '' || /^\d*\.?\d*$/.test(value)) {
               setInputValue(value)
          }
     }

     return (
          <div className="flex flex-1 flex-col">
               <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                         {/* Header */}
                         <div className="px-4 lg:px-6">
                              <div className="flex items-center gap-3">
                                   <Settings2 className="h-8 w-8" />
                                   <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                                        <p className="text-muted-foreground">
                                             Manage platform settings and configurations
                                        </p>
                                   </div>
                              </div>
                         </div>

                         <Separator />

                         {/* Discount Rate Section */}
                         <div className="px-4 lg:px-6">
                              <div className="max-w-2xl">
                                   <Card>
                                        <CardHeader>
                                             <div className="flex items-center gap-2">
                                                  <Percent className="h-5 w-5" />
                                                  <CardTitle>Withdrawal Discount Rate</CardTitle>
                                             </div>
                                             <CardDescription>
                                                  Set the percentage fee charged on withdrawal transactions
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                             {/* Information Alert */}
                                             <Alert>
                                                  <Info className="h-4 w-4" />
                                                  <AlertTitle>About Discount Rate</AlertTitle>
                                                  <AlertDescription>
                                                       This percentage will be deducted from each withdrawal request.
                                                       For example, if a user requests to withdraw 100,000 VND and the
                                                       discount rate is 17%, they will receive 83,000 VND after the fee.
                                                  </AlertDescription>
                                             </Alert>

                                             {/* Current Value Display */}
                                             {loading ? (
                                                  <div className="space-y-2">
                                                       <Skeleton className="h-4 w-32" />
                                                       <Skeleton className="h-10 w-full" />
                                                  </div>
                                             ) : (
                                                  <div className="space-y-4">
                                                       <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Current Rate</span>
                                                            <span className="text-2xl font-bold text-primary">
                                                                 {discountRate}%
                                                            </span>
                                                       </div>

                                                       {/* Input Form */}
                                                       <div className="space-y-2">
                                                            <Label htmlFor="discount-rate">New Discount Rate (%)</Label>
                                                            <div className="flex gap-2">
                                                                 <div className="relative flex-1">
                                                                      <Input
                                                                           id="discount-rate"
                                                                           type="text"
                                                                           placeholder="Enter percentage (0-100)"
                                                                           value={inputValue}
                                                                           onChange={handleInputChange}
                                                                           disabled={updating}
                                                                           className="pr-8"
                                                                      />
                                                                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                 </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                 Enter a value between 0 and 100
                                                            </p>
                                                       </div>

                                                       {/* Action Buttons */}
                                                       <div className="flex gap-2">
                                                            <Button
                                                                 onClick={handleSaveClick}
                                                                 disabled={!hasChanges || updating}
                                                                 className="gap-2"
                                                            >
                                                                 {updating ? (
                                                                      <>
                                                                           <Loader2 className="h-4 w-4 animate-spin" />
                                                                           Updating...
                                                                      </>
                                                                 ) : (
                                                                      <>
                                                                           <Save className="h-4 w-4" />
                                                                           Save Changes
                                                                      </>
                                                                 )}
                                                            </Button>
                                                            <Button
                                                                 variant="outline"
                                                                 onClick={handleReset}
                                                                 disabled={!hasChanges || updating}
                                                            >
                                                                 Cancel
                                                            </Button>
                                                       </div>

                                                       {/* Warning Alert */}
                                                       {hasChanges && (
                                                            <Alert variant="destructive">
                                                                 <AlertCircle className="h-4 w-4" />
                                                                 <AlertTitle>Warning</AlertTitle>
                                                                 <AlertDescription>
                                                                      Changing the discount rate will affect all future withdrawal
                                                                      requests. Please ensure the value is correct before saving.
                                                                 </AlertDescription>
                                                            </Alert>
                                                       )}
                                                  </div>
                                             )}
                                        </CardContent>
                                   </Card>

                                   {/* Example Calculation Card */}
                                   {!loading && inputValue && !isNaN(parseFloat(inputValue)) && (
                                        <Card className="mt-6">
                                             <CardHeader>
                                                  <CardTitle className="text-lg">Calculation Example</CardTitle>
                                                  <CardDescription>
                                                       See how the discount rate affects withdrawals
                                                  </CardDescription>
                                             </CardHeader>
                                             <CardContent>
                                                  <div className="space-y-3">
                                                       <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                            <span className="text-sm">Withdrawal Request</span>
                                                            <span className="font-semibold">1,000,000 VND</span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                            <span className="text-sm">Discount Rate</span>
                                                            <span className="font-semibold text-orange-600">
                                                                 {parseFloat(inputValue).toFixed(2)}%
                                                            </span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                            <span className="text-sm">Fee Amount</span>
                                                            <span className="font-semibold text-red-600">
                                                                 -{(1000000 * parseFloat(inputValue) / 100).toLocaleString('vi-VN')} VND
                                                            </span>
                                                       </div>
                                                       <Separator />
                                                       <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                                            <span className="font-medium">User Receives</span>
                                                            <span className="text-lg font-bold text-primary">
                                                                 {(1000000 * (100 - parseFloat(inputValue)) / 100).toLocaleString('vi-VN')} VND
                                                            </span>
                                                       </div>
                                                  </div>
                                             </CardContent>
                                        </Card>
                                   )}
                              </div>
                         </div>

                         {/* Future Settings Placeholder */}
                         <div className="px-4 lg:px-6">
                              <div className="max-w-2xl">
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>More Settings Coming Soon</CardTitle>
                                             <CardDescription>
                                                  Additional platform settings will be available here in future updates
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             <p className="text-sm text-muted-foreground">
                                                  Stay tuned for more configuration options to customize your platform.
                                             </p>
                                        </CardContent>
                                   </Card>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Confirmation Dialog */}
               <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent>
                         <DialogHeader>
                              <div className="flex items-center gap-2">
                                   <AlertTriangle className="h-5 w-5 text-orange-500" />
                                   <DialogTitle>Confirm Discount Rate Update</DialogTitle>
                              </div>
                              <DialogDescription className="pt-3">
                                   Are you sure you want to update the withdrawal discount rate?
                              </DialogDescription>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Current Rate</p>
                                        <p className="text-2xl font-bold">{discountRate}%</p>
                                   </div>
                                   <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">New Rate</p>
                                        <p className="text-2xl font-bold text-primary">{inputValue}%</p>
                                   </div>
                              </div>
                              <Alert>
                                   <Info className="h-4 w-4" />
                                   <AlertDescription>
                                        This change will affect all future withdrawal requests immediately.
                                   </AlertDescription>
                              </Alert>
                         </div>
                         <DialogFooter>
                              <Button
                                   variant="outline"
                                   onClick={() => setShowConfirmDialog(false)}
                                   disabled={updating}
                              >
                                   Cancel
                              </Button>
                              <Button
                                   onClick={handleConfirmUpdate}
                                   disabled={updating}
                                   className="gap-2"
                              >
                                   {updating ? (
                                        <>
                                             <Loader2 className="h-4 w-4 animate-spin" />
                                             Updating...
                                        </>
                                   ) : (
                                        <>
                                             <CheckCircle2 className="h-4 w-4" />
                                             Confirm Update
                                        </>
                                   )}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
