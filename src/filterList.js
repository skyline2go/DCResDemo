import * as React from "react";

interface Props { listingEl: any }
interface State {  }

export default class FilterList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {  }
  }

  render() {
    return (
      <div class='map-overlay'>
        <fieldset>
        <input id='feature-filter' type='text' placeholder='Filter results by name' />
        </fieldset>
        <div id='feature-listing' class='row'></div>
    </div>
    )
  }
}