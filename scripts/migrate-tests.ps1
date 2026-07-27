param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$srcDir = Join-Path $PSScriptRoot ".." "src"
$scriptRoot = $PSScriptRoot

# All .test.ts files relative to src/
$testFiles = @(
    "script.test.ts",
    "main/Answer.test.ts",
    "main/Constants.test.ts",
    "main/DataManagement.test.ts",
    "main/Dom.test.ts",
    "main/DomRegistry.test.ts",
    "main/EdgeCases.test.ts",
    "main/ErrorHandler.test.ts",
    "main/EventBinder.test.ts",
    "main/Events.test.ts",
    "main/Generation.test.ts",
    "main/MathWorkerClient.test.ts",
    "main/Mcq.test.ts",
    "main/OfflineIndicator.test.ts",
    "main/PrintWorksheet.test.ts",
    "main/QuestionGenerator.test.ts",
    "main/QuestionState.test.ts",
    "main/Session.test.ts",
    "main/Settings.test.ts",
    "main/Skeleton.test.ts",
    "main/StateStore.test.ts",
    "main/Theme.test.ts",
    "main/TopicRegistry.test.ts",
    "main/Topics.test.ts",
    "main/Ui.test.ts",
    "main/VirtualTopicGrid.test.ts",
    "main/WeakTopics.test.ts",
    "main/core/Rng.test.ts",
    "modules/Algebra/AlgebraAdvanced.test.ts",
    "modules/Algebra/AlgebraBasics.test.ts",
    "modules/Algebra/AlgebraEquations.test.ts",
    "modules/Algebra/AlgebraGraphingPolynomials.test.ts",
    "modules/Algebra/AlgebraInPrecalculus.test.ts",
    "modules/Algebra/AlgebraUtils.test.ts",
    "modules/Algebra/index.test.ts",
    "modules/Algebra/advanced/GenerateComplex.test.ts",
    "modules/Algebra/advanced/GenerateExponent.test.ts",
    "modules/Algebra/advanced/GenerateExponentRules.test.ts",
    "modules/Algebra/advanced/GenerateFactorial.test.ts",
    "modules/Algebra/advanced/GenerateLinearWordProblem.test.ts",
    "modules/Algebra/advanced/GenerateLogarithm.test.ts",
    "modules/Algebra/advanced/GenerateRadicalEquation.test.ts",
    "modules/Algebra/advanced/GenerateRadicalSimplify.test.ts",
    "modules/Algebra/advanced/GenerateRationalExponents.test.ts",
    "modules/Algebra/advanced/GenerateRoot.test.ts",
    "modules/Algebra/advanced/GenerateScientificNotation.test.ts",
    "modules/Algebra/advanced/GenerateSeries.test.ts",
    "modules/Algebra/advanced/GenerateVariation.test.ts",
    "modules/Algebra/basics/GenerateExpressionEvaluation.test.ts",
    "modules/Algebra/basics/GenerateFraction.test.ts",
    "modules/Algebra/basics/GenerateNumberSets.test.ts",
    "modules/Algebra/basics/GenerateOrderOfOperations.test.ts",
    "modules/Algebra/basics/GeneratePercent.test.ts",
    "modules/Algebra/basics/GenerateProperties.test.ts",
    "modules/Algebra/basics/GenerateRatioProportion.test.ts",
    "modules/Algebra/basics/GenerateUnitConversion.test.ts",
    "modules/Algebra/precalculus/GenerateBasicFunctions.test.ts",
    "modules/Algebra/precalculus/GenerateCartesianConcepts.test.ts",
    "modules/Algebra/precalculus/GenerateCircleEquations.test.ts",
    "modules/Algebra/precalculus/GenerateComplexZeros.test.ts",
    "modules/Algebra/precalculus/GenerateExponentialModeling.test.ts",
    "modules/Algebra/precalculus/GenerateFinance.test.ts",
    "modules/Algebra/precalculus/GenerateFunctionOperations.test.ts",
    "modules/Algebra/precalculus/GenerateFunctionProperties.test.ts",
    "modules/Algebra/precalculus/GenerateInverseFunctions.test.ts",
    "modules/Algebra/precalculus/GenerateLinearEquationSpecial.test.ts",
    "modules/Algebra/precalculus/GenerateLogarithmicModeling.test.ts",
    "modules/Algebra/precalculus/GenerateLogisticFunctions.test.ts",
    "modules/Algebra/precalculus/GeneratePolynomialEndBehavior.test.ts",
    "modules/Algebra/precalculus/GeneratePolynomialInequality.test.ts",
    "modules/Algebra/precalculus/GeneratePowerFunctionModeling.test.ts",
    "modules/Algebra/precalculus/GenerateRationalEquation.test.ts",
    "modules/Algebra/precalculus/GenerateRationalGraphAnalysis.test.ts",
    "modules/Algebra/precalculus/GenerateRealNumberOperations.test.ts",
    "modules/Algebra/precalculus/GenerateSyntheticDivision.test.ts",
    "modules/Algebra/precalculus/GenerateTransformations.test.ts",
    "modules/Arithmetic/ArithmeticAdvanced.test.ts",
    "modules/Arithmetic/ArithmeticBasic.test.ts",
    "modules/Arithmetic/ArithmeticUtils.test.ts",
    "modules/Arithmetic/index.test.ts",
    "modules/Calculus/CalculusApplicationsDiff.test.ts",
    "modules/Calculus/CalculusDerivatives.test.ts",
    "modules/Calculus/CalculusGraphical.test.ts",
    "modules/Calculus/CalculusIntegrals.test.ts",
    "modules/Calculus/CalculusIntegrationAdvanced.test.ts",
    "modules/Calculus/CalculusLimitsContinuity.test.ts",
    "modules/Calculus/CalculusLimitsRelated.test.ts",
    "modules/Calculus/CalculusParametricPolarVector.test.ts",
    "modules/Calculus/CalculusSequencesSeries.test.ts",
    "modules/Calculus/CalculusUtils.test.ts",
    "modules/Calculus/index.test.ts",
    "modules/DiscreteMathematics/DiscretePermutationsCombinations.test.ts",
    "modules/DiscreteMathematics/DiscreteProbability.test.ts",
    "modules/DiscreteMathematics/DiscreteSequenceSeries.test.ts",
    "modules/DiscreteMathematics/DiscreteStatistics.test.ts",
    "modules/DiscreteMathematics/DiscreteUtils.test.ts",
    "modules/DiscreteMathematics/index.test.ts",
    "modules/Geometry/GeometryAnalytic.test.ts",
    "modules/Geometry/GeometryArea.test.ts",
    "modules/Geometry/GeometryMisc.test.ts",
    "modules/Geometry/GeometryTriangles.test.ts",
    "modules/Geometry/GeometryUtils.test.ts",
    "modules/Geometry/GeometryVisualization.test.ts",
    "modules/Geometry/GeometryVolume.test.ts",
    "modules/Geometry/index.test.ts",
    "modules/LinearAlgebra/index.test.ts",
    "modules/LinearAlgebra/LinearAlgebraAdvanced.test.ts",
    "modules/LinearAlgebra/LinearAlgebraMatrix.test.ts",
    "modules/LinearAlgebra/LinearAlgebraUtils.test.ts",
    "modules/LinearAlgebra/LinearAlgebraVector.test.ts",
    "modules/Trigonometry/index.test.ts",
    "modules/Trigonometry/TrigAdvanced.test.ts",
    "modules/Trigonometry/TrigAnalytic.test.ts",
    "modules/Trigonometry/TrigBasic.test.ts",
    "modules/Trigonometry/TrigReciprocal.test.ts",
    "modules/Trigonometry/TrigUtils.test.ts"
)

$total = $testFiles.Count
$count = 0

# Change to repo root
Set-Location -LiteralPath (Join-Path $PSScriptRoot "..")

foreach ($file in $testFiles) {
    $count++
    $oldPath = Join-Path $srcDir $file
    $newPath = Join-Path $srcDir "__tests__" $file

    if (-not (Test-Path -LiteralPath $oldPath)) {
        Write-Warning "[$count/$total] SKIP (not found): $file"
        continue
    }

    Write-Host "[$count/$total] Processing: $file" -ForegroundColor Cyan

    if (-not $DryRun) {
        # Run the Node.js migration script to create new file with adjusted imports
        $output = & node (Join-Path $scriptRoot "move-test-files.mjs") $file 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Node script failed for $file`: $output"
            exit 1
        }

        # Verify new file exists
        if (-not (Test-Path -LiteralPath $newPath)) {
            Write-Error "New file not created: $newPath"
            exit 1
        }

        # Delete original file
        Remove-Item -LiteralPath $oldPath -Force

        # Git add both the deletion and the new file
        & git add -A 2>&1 | Out-Null

        # Commit
        $commitMsg = "move: relocate $file to src/__tests__/"
        & git commit -m $commitMsg --quiet 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  -> Committed: $commitMsg" -ForegroundColor Green
        } else {
            Write-Error "  -> Commit failed for $file"
            exit 1
        }
    }
    else {
        Write-Host "  [DRY RUN] Would move and commit: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! $count files processed." -ForegroundColor Green
