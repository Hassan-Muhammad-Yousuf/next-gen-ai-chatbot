'use server'
import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs"

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser()
  if (!user) return
  try {
    const subscription = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        _count: {
          select: {
            domains: true,
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    const domainExists = await client.user.findFirst({
      where: {
        clerkId: user.id,
        domains: {
          some: {
            name: domain,
          },
        },
      },
    })
  } catch (error){}
}

export const onGetSubscriptionPlan = async () => {
    try {
        const user = await currentUser()
        if(!user) return
        const plan = await client.user.findUnique({
            where: {
                clerkId: user.id,
            },
            select:{
                subscription:{
                    select:{
                        plan:true,
                    },
                },
            },
        });
        if(plan)
        {
            return plan.subscription?.plan
        }
        
    } catch (error) {
        console.log(error)        
    }
}

export const onGetAllAccountDomains = async () => {
    const user = await currentUser()
    if (!user) return
    try {
      const domains = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          id: true,
          domains: {
            select: {
              name: true,
              icon: true,
              id: true,
              customer: {
                select: {
                  chatRoom: {
                    select: {
                      id: true,
                      live: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      return { ...domains }
    } catch (error) {
      console.log(error)
    }
  }