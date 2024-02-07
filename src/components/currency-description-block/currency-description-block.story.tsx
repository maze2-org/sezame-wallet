import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { color } from "../../theme"
import { CurrencyDescriptionBlock } from "./currency-description-block"

storiesOf("CurrencyDescriptionBlock", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Primary" usage="The primary.">
        <CurrencyDescriptionBlock style={{ backgroundColor: color.error }} />
      </UseCase>
    </Story>
  ))
