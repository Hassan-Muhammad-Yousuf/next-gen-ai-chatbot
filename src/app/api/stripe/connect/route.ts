import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-06-20',
})

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) return new NextResponse('User not authenticated', { status: 401 })

    const account = await stripe.accounts.create({
      country: 'DE', // Germany's country code
      type: 'custom',
      business_type: 'company',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      external_account: 'btok_de', // Updated for Germany
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000), // Current timestamp
        ip: '172.18.80.19', // Replace with actual client IP if available
      },
    })

    if (!account) return new NextResponse('Failed to create Stripe account', { status: 400 })

    const approve = await stripe.accounts.update(account.id, {
      business_profile: {
        mcc: '5045', // MCC code for your business type, if different in Germany adjust accordingly
        url: 'https://bestcookieco.de', // German domain
      },
      company: {
        address: {
          city: 'Berlin',
          line1: 'Friedrichstraße 123',
          postal_code: '10117',
          state: 'BE', // German state code (Berlin)
        },
        tax_id: 'DE000000000', // Example German tax ID
        name: 'The Best Cookie Co GmbH', // GmbH is a common company type in Germany
        phone: '+49 30 12345678', // Example German phone number
      },
    })

    if (!approve) return new NextResponse('Failed to update Stripe account', { status: 400 })

    const person = await stripe.accounts.createPerson(account.id, {
      first_name: 'Jenny',
      last_name: 'Rosen',
      relationship: {
        representative: true,
        title: 'Geschäftsführer', // CEO in German
      },
    })

    if (!person) return new NextResponse('Failed to create person on Stripe account', { status: 400 })

    const approvePerson = await stripe.accounts.updatePerson(account.id, person.id, {
      address: {
        city: 'Berlin',
        line1: 'Friedrichstraße 123',
        postal_code: '10117',
        state: 'BE', // Berlin state code
      },
      dob: {
        day: 10,
        month: 11,
        year: 1980,
      },
      ssn_last_4: '0000', // Not relevant for Germany, but keep for format
      phone: '+49 30 12345678', // Example German phone number
      email: 'jenny@bestcookieco.de', // German domain email
      relationship: {
        executive: true,
      },
    })

    if (!approvePerson) return new NextResponse('Failed to update person on Stripe account', { status: 400 })

    const owner = await stripe.accounts.createPerson(account.id, {
      first_name: 'Kathleen',
      last_name: 'Banks',
      email: 'kathleen@bestcookieco.de',
      address: {
        city: 'Berlin',
        line1: 'Friedrichstraße 123',
        postal_code: '10117',
        state: 'BE', // Berlin state code
      },
      dob: {
        day: 10,
        month: 11,
        year: 1980,
      },
      phone: '+49 30 12345678', // Example German phone number
      relationship: {
        owner: true,
        percent_ownership: 80,
      },
    })

    if (!owner) return new NextResponse('Failed to create owner on Stripe account', { status: 400 })

    const complete = await stripe.accounts.update(account.id, {
      company: {
        owners_provided: true,
      },
    })

    if (!complete) return new NextResponse('Failed to complete Stripe account update', { status: 400 })

    const saveAccountId = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        stripeId: account.id,
      },
    })

    if (!saveAccountId) return new NextResponse('Failed to save Stripe account ID', { status: 500 })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
       refresh_url: 'http://localhost:3000/callback/stripe/refresh',
      return_url: 'http://localhost:3000/callback/stripe/success',
      type: 'account_onboarding',
      collection_options: {
        fields: 'currently_due',
      },
    })

    return NextResponse.json({
      url: accountLink.url,
    })
  } catch (error) {
    console.error('An error occurred when calling the Stripe API to create an account:', error)
    return new NextResponse('An error occurred', { status: 500 })
  }
}
