import React from 'react'
import { useForm } from 'react-hook-form'

export const FormDecorator = (Story, context) => {
  const formControl = useForm({ defaultValues: context.args.defaultValues || {} })
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Story args={{ ...context.args, formControl }} />
    </form>
  )
}
