import argparse
import json
import sys
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, BarColumn, TextColumn
from rich.text import Text

from mindmesh.core.debate import DebateSession
from mindmesh.core.models import DebateResult

def print_pretty_result(result: DebateResult):
    console = Console()
    
    # 1. Panel showing the query
    console.print(Panel(result.query, title="[bold blue]Query", border_style="blue"))
    
    # 2. Proposer's answer and confidence
    console.print("\n[bold yellow]Proposer's Answer:[/bold yellow]")
    console.print(result.proposal.content)
    
    with Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console
    ) as progress:
        progress.add_task("[yellow]Confidence", total=100, completed=result.proposal.confidence * 100)

    # 3. Challenger's weaknesses as a red bullet list
    console.print("\n[bold red]Challenger's Identified Weaknesses:[/bold red]")
    for weakness in result.challenge.weaknesses:
        console.print(f"[red]• {weakness}[/red]")
        
    # 4. Arbitrator's verdict with scores
    console.print("\n[bold magenta]Arbitrator's Verdict:[/bold magenta]")
    verdict_text = Text(f"Result: {result.arbitration.verdict.value}", style="bold magenta")
    console.print(verdict_text)
    
    with Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console
    ) as progress:
        progress.add_task("[magenta]Proposer Score", total=100, completed=result.arbitration.proposer_score * 100)
        progress.add_task("[magenta]Challenger Score", total=100, completed=result.arbitration.challenger_score * 100)

    # 5. Final synthesized answer in a green panel
    console.print()
    console.print(Panel(result.final_answer, title="[bold green]Final Synthesized Answer", border_style="green"))


def main():
    parser = argparse.ArgumentParser(description="Maieo AI Multi-Agent Debate CLI")
    parser.add_argument("query", type=str, help="The debate question")
    parser.add_argument("--rounds", type=int, default=1, help="Number of debate rounds (currently only 1 supported)")
    parser.add_argument("--output", type=str, choices=["pretty", "json"], default="pretty", help="Output format")
    parser.add_argument("--save", type=str, help="Optional file path to save the JSON result")
    
    args = parser.parse_args()
    
    session = DebateSession()
    
    try:
        # We only support 1 round structurally at the moment.
        result = session.run(args.query)
    except Exception as e:
        print(f"Error during debate: {e}", file=sys.stderr)
        sys.exit(1)
        
    if args.output == "json":
        print(json.dumps(result.to_dict(), indent=2))
    else:
        print_pretty_result(result)
        
    if args.save:
        try:
            with open(args.save, 'w', encoding='utf-8') as f:
                json.dump(result.to_dict(), f, indent=2)
            if args.output != "json":
                print(f"\nResult saved to {args.save}")
        except Exception as e:
            print(f"Error saving to file: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
